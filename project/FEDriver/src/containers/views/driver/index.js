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
Geocode.setApiKey("AIzaSyAgz67Cbm_ZoBesm7sOeTUV7Q-30HjtAY8");
// AIzaSyCRwKDRudmnflj_-cxiDgY3amDog-W8zmk
// AIzaSyC7itkRW-zOLxIF-Mhgmzn1iv35oiplrt8
// AIzaSyAgz67Cbm_ZoBesm7sOeTUV7Q-30HjtAY8

// set response language. Defaults to english.
Geocode.setLanguage("vi");
// set response region. Its optional.
// A Geocoding request with region=es (Spain) will return the Spanish city.
Geocode.setRegion("vn");

const options = [
  { key: "1", text: "Xe máy", value: "1" },
  { key: "4", text: "Xe 4 chỗ", value: "4" },
  { key: "7", text: "Xe 7 chỗ", value: "7" },
  { key: "35", text: "Xe 35 chỗ", value: "35" },
  { key: "0", text: "Xe bán tải", value: "0" },
  { key: "99", text: "Xe khác", value: "99" },
];

const url = "ws://localhost:8080/websocket";
let timerId = null;

function Driver() {
  const [userId] = useState(localStorage.getItem("userId"));
  const [name] = useState(localStorage.getItem("name"));
  const [address] = useState(localStorage.getItem("address"));
  const [lng, setLng] = useState(localStorage.getItem("lng")); // will login and get data from user location
  const [lat, setLat] = useState(localStorage.getItem("lat")); // will login and get data from user location
  const [phoneNumber] = useState(localStorage.getItem("phoneNumber"));
  const [carType, setCarType] = useState("Xe máy");
  const [bookingId, setBookingId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");

  const [connected, setConnected] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [distanceToUser, setDistanceToUser] = useState("");
  const [role] = useState(localStorage.getItem("role"));
  const [canCancel, setCanCancel] = useState(false);
  const [waitForConfirm, setWaitForConfirm] = useState(false);

  let [connection, setConnection] = useState(new WebSocket(url));
  // After DOM ready
  useEffect(() => {
    connection.onopen = () => {
      console.log("open websocket");
      connection.send(
        `{"messageType": "REGISTER", "application":"DRIVER", "userId":${userId}}`
      );
    };

      // Get latitude & longitude from address.
      // Submit location
      if (timerId === null) {
        var ref = this;
        timerId = setInterval(function () {
          console.log('Update location automaticaly');
          // updateLocationOfUser();
        }, 5000);
      }
      // updateLocationOfUser();
    }, [bookingId, connected, userId, clientId, connection]);
  
    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    connection.onmessage = (e) => {
      // sample received message {
      // "messageType": "BOOKING_ALERT",
      // "application": "ADMIN",
      // "clientId": "1",
      // "clientName": "Nguyen Thi Thuy Trang 1",
      // "booking": "634be924346e044c6b1e4008",
      // "address": "1 Lê Duẩn, Quận 1, Hồ Chí Minh",
      // "phoneNumber": "123456"
      // }
      console.log(e.data);
      var parsedMessage = JSON.parse(e.data);
      if (
        parsedMessage.messageType === "BOOKING_ALERT" &&
        parsedMessage.application === "ADMIN"
      ) {
        setBookingId(parsedMessage.bookingId);
        setClientId(parsedMessage.clientId);
        setClientPhoneNumber(parsedMessage.phoneNumber);
        setClientAddress(parsedMessage.address);
        setIsBusy(true);
        setDistanceToUser(parsedMessage.distanceToUser);
        console.log(parsedMessage.clientId);
        fetch(
          `http://localhost:8080/users/detail?userId=${parsedMessage.clientId}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
            setClientName(response.name);
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (
        parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT" &&
        parsedMessage.bookingId === bookingId
      ) {
        setConnected(true);
      }
    };

  function updateLocationOfUser() {
    console.log("interval send location of driver to server");
    // IT works
    // Call google api to get long and lat of current address and update to user location table
    Geocode.fromAddress(address).then(
      (response) => {
        const res = response.results[0].geometry.location;
        console.log(res.lat, res.lng);
        setLng(res.lng);
        setLat(res.lat);

        fetch("http://localhost:8080/users/location", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            address: address,
            lng: lng,
            lat: lat,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
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

  function componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  }

  function handleMeetClient() {
    fetch("http://localhost:8080/users/booking-status", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        _id: bookingId,
        status: "MEET_CLIENT",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(`got response -> send message ${JSON.stringify(response)}`);
        setBookingId( response._id);
        connection.send(`{
          "messageType": "MEET_CLIENT", 
          "application": "DRIVER", 
          "userId": "${userId}",
          "_id": "${bookingId}",
          "clientId": "${clientId}"
        }`);
        setCanCancel(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCancelBooking() {
    if (bookingId && connected) {
      console.log(`send cancel booking to server`);
      connection.send(`{
          "messageType": "BOOKING_CANCELED",
          "application": "DRIVER",
          "userId": "${userId}",
          "_id": "${bookingId}",
          "clientId": "${clientId}"
          }`);
    }
  }

  function handleSubmit(event) {
     connection.send(`{
      "messageType": "BOOKING_ACCEPT", 
      "application": "DRIVER", 
      "clientId": "${clientId}", 
      "bookingId": "${bookingId}",
      "driverId": "${userId}",
      "driverName": "${name}",
      "driverPhoneNumber": "${phoneNumber}",
      "distanceToUser": "${distanceToUser}"
      }`);
      setCanCancel(true);
      setWaitForConfirm(true);
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
              pt={3}
            >
              <Grid.Column style={{ maxWidth: 450 }}>
                <Grid.Row style={{ padding: "10px" }}>
                  <Grid.Column>
                    <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                    <Header as="h4">Xin chào tài xế</Header>
                  </Grid.Column>
                </Grid.Row>
                <div className="ui segment">
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Tên bác tài: </label>
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
                        <label>Địa điểm: </label>
                        <label>{address}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                </div>

                {clientId === "" ? (
                  ""
                ) : (
                  <div className="ui segment">
                    <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Thông tin cuốc xe</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Tên hành khách: </label>
                          <label>{clientName}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Số điện thoại khách hàng: </label>
                          <label>{clientPhoneNumber}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Địa điểm đón: </label>
                          <label>{clientAddress}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Khoảng cách: </label>
                          <label>{distanceToUser} km</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <label style={{ color: "red" }}>
                      {connected === false ? "" : "Vui lòng đến đón khách hàng"}
                    </label>
                  </div>
                )}

                <Grid.Row style={{ padding: "10px" }}>
                  {(bookingId !== '' && connected === false && waitForConfirm === false )? (
                    <Button type="submit" primary onClick={handleSubmit}>
                      Nhận cuốc xe
                    </Button>
                  ) : '' }
                  {(bookingId !== '' && connected === false) ? (<Button>Bỏ qua</Button>) : "" }

                  {bookingId !== '' && connected === true && canCancel ? (
                    <Button
                      primary
                      onClick={handleMeetClient}
                    >
                      Đến nơi
                    </Button>
                  ) : ''}
                  {bookingId !== '' && connected === true && canCancel ? (
                    <Button
                      secondary
                      onClick={handleCancelBooking}
                      disabled={bookingId !== ""}
                    >
                      Hủy cuốc xe
                    </Button>
                  ) : '' }
                </Grid.Row>
              </Grid.Column>
            </Grid>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default Driver;
