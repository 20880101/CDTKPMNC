import React, { useState, useCallback, useEffect } from "react";
import Geocode from "react-geocode";
import {
  Grid,
  Button,
  Form,
  TextArea,
  Select,
  Header,
  Container,
} from "semantic-ui-react";

// https://www.npmjs.com/package/react-geocode
Geocode.setApiKey("AIzaSyC7itkRW-zOLxIF-Mhgmzn1iv35oiplrt8");
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
let timerId = null;

class User extends React.Component {
  constructor(props) {
    super(props);

    localStorage.getItem("authenticated");
    localStorage.getItem("activated");

    this.state = {
      userId: localStorage.getItem("userId"),
      name: localStorage.getItem("name"),
      phoneNumber: localStorage.getItem("phoneNumber"),
      address: "1 Lê Duẩn, Quận 1, Hồ Chí Minh",
      lng: undefined,
      lat: undefined,
      carType: "1",
      driverName: null,
      driverPhoneNumber: null,
      hasDriver: false,
      bookingId: "",
      hasBooking: false,
      driverId: undefined,
      role: localStorage.getItem("role")
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeCarType = this.handleChangeCarType.bind(this);
    this.handleCancelBooking = this.handleCancelBooking.bind(this);
    this.wrapper = React.createRef();
  }

  componentDidMount() {
    console.log('componentDidMount');
    connection.onopen = () => {
      console.log('onopen');
      connection.send(
        `{"messageType": "REGISTER", "application": "${this.state.role}", "userId":${this.state.userId}}`
      );
    };

    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    connection.onmessage = (e) => {
      console.log(e.data);
      var parsedMessage = JSON.parse(e.data);
      if (parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT") {
        this.setState({ driverName: parsedMessage.driverName });
        this.setState({ driverPhoneNumber: parsedMessage.driverPhoneNumber });
        this.setState({ hasDriver: true });
        this.setState({ driverId: parsedMessage.driverId });
        this.state.hasDriver = true;
      }
    };
  }

  handleSubmit(event) {
    console.log("submitFunction");
    // Get latitude & longitude from address.
    Geocode.fromAddress(this.state.address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log(lng, lat);
        this.state.lng = lng;
        this.state.lat = lat;

        console.log('update current location');
        fetch("http://localhost:8080/users/location", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: this.state.userId,
            address: this.state.address,
            lng: this.state.lng,
            lat: this.state.lat
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });

        console.log('Create a booking');
        fetch("http://localhost:8080/users/booking", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: this.state.userId,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            lng: this.state.lng,
            lat: this.state.lat,
            carType: this.state.carType,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(`got response -> send message ${JSON.stringify(response)}`);
            this.state.bookingId = response._id;
            this.state.hasBooking = true;
            connection.send(`{
              "messageType": "BOOKING", 
              "application": "CLIENT", 
              "userId": "${this.state.userId}", 
              "booking": "${response._id}",
              "address": "${this.state.address}",
              "phoneNumber": "${this.state.phoneNumber}",
              "carType": "${this.state.carType}"
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

  handleChangeAddress(event) {
    this.setState({ address: event.target.value });
  }

  handleChangeCarType(event, value) {
    this.setState({ carType: value.value});
  }

  handleCancelBooking(event) {
    if (this.state.bookingId) {
      fetch("http://localhost:8080/users/booking-status", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          userId: this.state.userId,
          _id: this.state.bookingId,
          status: "CANCELED"
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(`got response -> cancel booking`);
          connection.send(`{
          "messageType": "BOOKING_CANCELED",
          "application": "CLIENT",
          "userId": "${this.state.userId}",
          "bookingId": "${this.state.bookingId}",
          "driverId": "${this.state.driverId}"
          }`);
          this.state.hasBooking = false;
          this.state.bookingId = '';
          this.state.hasDriver = false;
          this.state.driverId = '';
          this.state.driverPhoneNumber = '';
          this.state.driverName = '';
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  render() {
    return (
      <>
        <div ref={this.wrapper}>
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
                          <label>{this.state.name}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Số điện thoại: </label>
                          <label>{this.state.phoneNumber}</label>
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
                            value={this.state.address}
                            onChange={this.handleChangeAddress}
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
                            value={this.state.carType}
                            onChange={(event, value) =>
                              this.handleChangeCarType(event, value)
                            }
                          />
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                  </div>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button
                      type="submit"
                      disabled={!!this.state.hasBooking}
                      primary
                      onClick={this.handleSubmit}
                    >
                      Gọi xe
                    </Button>
                    {this.state.hasBooking === false ? (
                      ""
                    ) : (
                      <Button
                      secondary
                      onClick={this.handleCancelBooking}
                    >
                      Hủy gọi
                    </Button>
                    )}
                    
                  </Grid.Row>
                  {this.state.hasDriver === false ? (
                    ""
                  ) : (
                    <div className="ui segment">
                      <Grid.Row style={{ padding: "10px" }}>
                        <Form.Field>
                          <Grid.Column align="left">
                            <label>Tên bác tài: </label>
                            <label>{this.state.driverName}</label>
                          </Grid.Column>
                        </Form.Field>
                      </Grid.Row>
                      <Grid.Row style={{ padding: "10px" }}>
                        <Form.Field>
                          <Grid.Column align="left">
                            <label>Số điện thoại: </label>
                            <label>{this.state.driverPhoneNumber}</label>
                          </Grid.Column>
                        </Form.Field>
                      </Grid.Row>
                      <Grid.Row style={{ padding: "10px" }}>
                        <Form.Field>
                          <Grid.Column align="center">
                            <label>
                              {this.state.hasDriver === false
                                ? ""
                                : "Vui lòng chờ trong giây lát, bác tài sẽ tới ngay!"}
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
}

export default User;
