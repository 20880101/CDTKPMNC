import React from "react";
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
Geocode.setApiKey("AIzaSyC7itkRW-zOLxIF-Mhgmzn1iv35oiplrt8");
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
const connection = new WebSocket(url);
let timerId = null;

class Driver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "11",
      name: "Tài xế 1",
      address: localStorage.getItem("address"),
      lng: undefined,
      lat: undefined,
      phoneNumber: "003551234",
      carType: "1",
      bookingDetail: "",
      bookingId: undefined,
      clientId: undefined,
      clientName: "",
      clientAddress: "",
      clientPhoneNumber: "",
      isBusy: false,
      connected: false,
      role: localStorage.getItem("role")
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancelBooking = this.handleCancelBooking.bind(this);
    this.handleMeetClient = this.handleMeetClient.bind(this);
    this.wrapper = React.createRef();
  }

  // After DOM ready
  componentDidMount() {
    var ref = this;
    connection.onopen = () => {
      connection.send(
        `{"messageType": "REGISTER", "application":"DRIVER", "userId":${this.state.userId}}`
      );
    };

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
        this.setState({ bookingId: parsedMessage.bookingId });
        this.setState({ clientId: parsedMessage.clientId });
        this.setState({ clientPhoneNumber: parsedMessage.phoneNumber });
        this.setState({ clientAddress: parsedMessage.address });
        this.setState({ isBusy: true });
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
            this.setState({ clientName: response.name });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (
        parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT" &&
        parsedMessage.bookingId === this.state.bookingId
      ) {
        this.setState({ connected: true });
      }
    };

    // Get latitude & longitude from address.
    // Submit location
    // if (timerId === null) {
    //   var ref = this;
    //   timerId = setInterval(function () {
    //     // console.log('interval send location to server');
    //     Geocode.fromAddress(ref.state.address).then(
    //       (response) => {
    //         const { lat, lng } = response.results[0].geometry.location;
    //         console.log(lat, lng);
    //         ref.state.lng = lng;
    //         ref.state.lat = lat;
    
    //           fetch("http://localhost:8080/users/location", {
    //             method: "PUT",
    //             headers: {
    //               "content-type": "application/json",
    //               accept: "application/json",
    //             },
    //             body: JSON.stringify({
    //               userId: ref.state.userId,
    //               address: ref.state.address,
    //               lng: ref.state.lng,
    //               lat: ref.state.lat
    //             }),
    //           })
    //             .then((response) => response.json())
    //             .then((response) => {
    //               console.log(response);
    //             })
    //             .catch((err) => {
    //               console.log(err);
    //             });
    //       },
    //       (error) => {
    //         console.error(error);
    //       }
    //     );
    //   }, 5000);
    // }
  }

  componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  }

  handleChangeAddress(event) {
    this.setState({ address: event.target.value });
  }

  handleMeetClient() {
    fetch("http://localhost:8080/users/booking-status", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        userId: this.state.userId,
        _id: this.state.bookingId,
        status: "MEET_CLIENT",

      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(`got response -> send message ${JSON.stringify(response)}`);
        this.state.bookingId = response._id;
        this.state.hasBooking = true;
        connection.send(`{
          "messageType": "MEET_CLIENT", 
          "application": "DRIVER", 
          "userId": "${this.state.userId}",
          "_id": "${this.state.bookingId}",
          "clientId": "${this.state.clientId}"
        }`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleCancelBooking() {
    if (this.state.bookingId && this.state.connected) {
      console.log(`send cancel booking to server`);
        connection.send(`{
          "messageType": "BOOKING_CANCELED",
          "application": "DRIVER",
          "userId": "${this.state.userId}",
          "_id": "${this.state.bookingId}",
          "clientId": "${this.state.clientId}"
          }`);
        }
  }

  handleSubmit(event) {
    connection.send(`{
      "messageType": "BOOKING_ACCEPT", 
      "application": "DRIVER", 
      "clientId": "${this.state.clientId}", 
      "bookingId": "${this.state.bookingId}",
      "driverId": "${this.state.userId}",
      "driverName": "${this.state.name}",
      "driverPhoneNumber": "${this.state.phoneNumber}"
      }`);
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
                          <label>Địa điểm: </label>
                          <label>{this.state.address}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "10px" }}>
                      <Form.Field>
                        <Grid.Column align="left">
                          <label>Loại xe bác tài đang chạy: </label>
                          <label>{this.state.carType}</label>
                        </Grid.Column>
                      </Form.Field>
                    </Grid.Row>
                  </div>

                  {this.state.clientId === undefined ? (
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
                            <label>{this.state.clientName}</label>
                          </Grid.Column>
                        </Form.Field>
                      </Grid.Row>
                      <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                        <Form.Field>
                          <Grid.Column align="left">
                            <label>Số điện thoại khách hàng: </label>
                            <label>{this.state.clientPhoneNumber}</label>
                          </Grid.Column>
                        </Form.Field>
                      </Grid.Row>
                      <Grid.Row style={{ padding: "10px 10px 10px 10px" }}>
                        <Form.Field>
                          <Grid.Column align="left">
                            <label>Địa điểm đón: </label>
                            <label>{this.state.clientAddress}</label>
                          </Grid.Column>
                        </Form.Field>
                      </Grid.Row>
                      <label>
                        {this.state.connected === false
                          ? ""
                          : "Vui lòng đến đón khách hàng"}
                      </label>
                    </div>
                  )}

                  <Grid.Row style={{ padding: "10px" }}>
                    <Button
                      type="submit"
                      primary
                      disabled={this.state.connected}
                      onClick={this.handleSubmit}
                    >
                      Nhận cuốc xe
                    </Button>

                    {this.state.connected === false ? (
                      ""
                    ) : (
                      <Button primary disabled={!this.state.connected} onClick={this.handleMeetClient}>
                        Đến nơi
                      </Button>
                    )}

                    {this.state.connected === false ? (
                      ""
                    ) : (
                    <Button secondary onClick={this.handleCancelBooking}>
                      Hủy cuốc xe
                    </Button>
                    )}
                    <Button disabled={this.state.connected}>Bỏ qua</Button>
                  </Grid.Row>
                </Grid.Column>
              </Grid>
            </Form>
          </Container>
        </div>
      </>
    );
  }
}

export default Driver;
