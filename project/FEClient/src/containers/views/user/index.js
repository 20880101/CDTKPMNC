import React, { useState, useEffect } from "react";
import Geocode from "react-geocode";
import {
  Grid,
  Button,
  Form,
  Select,
  Header,
  Container,
} from "semantic-ui-react";

// https://www.npmjs.com/package/react-geocode
Geocode.setApiKey("AIzaSyCRwKDRudmnflj_-cxiDgY3amDog-W8zmk");
// set response language. Defaults to english.
Geocode.setLanguage("vi");
// set response region. Its optional.
// A Geocoding request with region=es (Spain) will return the Spanish city.
Geocode.setRegion("vn");

const options = [
  { text: "Xe máy", value: "1" },
  { text: "Xe 4 chỗ", value: "4" },
  { text: "Xe 7 chỗ", value: "7" },
  { text: "Xe 35 chỗ", value: "35" },
  { text: "Xe bán tải", value: "0" },
  { text: "Xe khác", value: "99" },
];

const url = "ws://localhost:8080/websocket";
const connection = new WebSocket(url);

function User() {
  localStorage.getItem("authenticated");
  localStorage.getItem("activated");
  const [userId] = useState(localStorage.getItem("userId"));
  const [name] = useState(localStorage.getItem("name"));
  const [phoneNumber] = useState(localStorage.getItem("phoneNumber"));
  const [address, setAddress] = useState("1 Huỳnh Tấn Phát, Quận 7, Hồ Chí Minh");

  const [lng, setLng] = useState(0.0);
  const [lat, setLat] = useState(0.0);
  const [carType, setCarType] = useState("1");
  const [driverName, setDriverName] = useState("");
  const [driverPhoneNumber, setDriverPhoneNumber] = useState("");

  const [hasDriver, setHasDriver] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [hasBooking, setHasBooking] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [role] = useState(localStorage.getItem("role"));
  const [meetDriver, setMeetDriver] = useState(false);
  const [bookingCancelledByDriver, setBookingCancelledByDriver] =
    useState(false);

  useEffect(() => {
    console.log("componentDidMount");
    connection.onopen = () => {
      console.log("onopen");
      connection.send(
        `{"messageType": "REGISTER", "application": "${role}", "userId":${userId}}`
      );
    };

    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    connection.onmessage = (e) => {
      console.log(e.data);
      var parsedMessage = JSON.parse(e.data);
      if (parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT") {
        setDriverName(parsedMessage.driverName);
        setDriverPhoneNumber(parsedMessage.driverPhoneNumber);
        setHasDriver(true);
        setDriverId(parsedMessage.driverId);
      } else if (
        parsedMessage.messageType === "BOOKING_CANCELED" &&
        parsedMessage.application === "DRIVER"
      ) {
        setDriverName("");
        setDriverPhoneNumber("");
        setHasDriver(false);
        setDriverId('');
        setBookingCancelledByDriver(true);
      } else if (parsedMessage.messageType === "MEET_CLIENT") {
        setMeetDriver(true);
      }
    };
  });

  function handleSubmit(event) {
    console.log("submitFunction");
    // Get latitude & longitude from address.
    Geocode.fromAddress(address).then(
      (response) => {
        const res = response.results[0].geometry.location;
        const resLat = res.lat;
        const resLng = res.lng;
        
        setLng(resLng);
        setLat(resLat);

        console.log(resLng, resLat);
        console.log(lng, lat);

        console.log("update current location");
        fetch("http://localhost:8080/users/location", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            address: address,
            lng: resLng,
            lat: resLat,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });

        console.log("Create a booking");
        fetch("http://localhost:8080/users/booking", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            address: address,
            phoneNumber: phoneNumber,
            lng: resLng,
            lat: resLat,
            carType: carType,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(
              `got response -> send message ${JSON.stringify(response)}`
            );
            setBookingId(response._id);
            setHasBooking(true);
            connection.send(`{
              "messageType": "BOOKING", 
              "application": "CLIENT", 
              "userId": "${userId}", 
              "booking": "${response._id}",
              "address": "${address}",
              "phoneNumber": "${phoneNumber}",
              "carType": "${carType}",
              "lng": ${resLng},
              "lat": ${resLat}
            }`);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  function handleChangeAddress(event) {
    setAddress(event.target.value);
  }

  function handleChangeCarType(event, value) {
    setCarType(value.value);
  }

  function handleCancelBooking(event) {
    if (bookingId) {
      fetch("http://localhost:8080/users/booking-status", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          _id: bookingId,
          status: "CANCELED",
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(`got response -> cancel booking`);
          connection.send(`{
          "messageType": "BOOKING_CANCELED",
          "application": "CLIENT",
          "userId": "${userId}",
          "bookingId": "${bookingId}",
          "driverId": "${driverId}"
          }`);
          setHasBooking(false);
          setBookingId("");
          setHasDriver(false);
          setDriverId("");
          setDriverPhoneNumber("");
          setDriverName("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  return (
    <>
      <div>
        <Container>
          <Form>
            <Grid
              textAlign="center"
              style={{ height: "90vh", padding: "10px" }}
              verticalAlign="middle"
              columns={1}
            >
              <Grid.Column style={{ maxWidth: 450 }}>
                <Grid.Row style={{ padding: "10px" }}>
                  <Grid.Column>
                    <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                    <Header as="h4">
                      Chúng tôi rất hân hạnh được phục vụ.
                    </Header>
                  </Grid.Column>
                </Grid.Row>
                <div className="ui segment">
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Xin chào: </label>
                        <label>{name}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Số điện thoại: </label>
                        <label>{phoneNumber}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Điểm đón:</label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="address"
                          type="text"
                          placeholder="1 Lê Duẩn, Quận 1, Hồ Chí Minh"
                          value={address}
                          onChange={handleChangeAddress}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Chọn loại xe:</label>
                      </Grid.Column>
                      <Grid.Column>
                        <Select
                          style={{ width: "100%" }}
                          options={options}
                          text={options.text}
                          placeholder="Chọn loại xe"
                          value={carType}
                          onChange={(event, value) =>
                            handleChangeCarType(event, value)
                          }
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                </div>
                <Grid.Row style={{ padding: "10px" }}>
                  {hasBooking === false ? (
                    <Button
                      type="submit"
                      disabled={!!hasBooking}
                      primary
                      onClick={handleSubmit}
                    >
                      Gọi xe
                    </Button>
                  ) : (
                    ""
                  )}

                  {hasBooking === false ? (
                    ""
                  ) : (
                    <Button secondary onClick={handleCancelBooking}>
                      Hủy gọi
                    </Button>
                  )}
                </Grid.Row>
                <Grid.Row style={{ padding: "10px" }}>
                  <label>
                    {bookingCancelledByDriver === false
                      ? ""
                      : "Tài xế hủy cuốc xe, vui lòng đợi trong giây lát"}
                  </label>
                </Grid.Row>
                {hasDriver === false ? (
                  ""
                ) : (
                  <div className="ui segment">
                    <Grid.Row style={{ padding: "10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Tên bác tài: </label>
                          <label>{driverName}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Số điện thoại: </label>
                          <label>{driverPhoneNumber}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px" }}>
                      <Form.Field>
                        <Grid.Column align="center">
                          <label>
                            {hasDriver === false
                              ? ""
                              : "Vui lòng chờ trong giây lát, bác tài sẽ tới ngay!"}
                          </label>
                          <label>
                            {meetDriver === false ? "" : "Bác tài đã tới nơi"}
                          </label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                  </div>
                )}
              </Grid.Column>
            </Grid>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default User;
