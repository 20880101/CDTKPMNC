import React, { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import {
  Grid,
  Button,
  Form,
  TextArea,
  Select,
  Header,
  Container,
} from "semantic-ui-react";

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
      address: "Tran Hung Dao, Quan 1, Ho Chi Minh",
      lng: 10,
      lat: 10,
      phoneNumber: "003551234",
      carType: "1",
      bookingDetail: "",
      bookingId: "",
      clientId: "",
      clientName: "",
      clientAddress: "",
      clientPhoneNumber: "",
      isBusy: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.wrapper = React.createRef();
  }

  // After DOM ready
  componentDidMount() {
    var ref = this;
    connection.onopen = () => {
      connection.send(`{"messageType": "REGISTER", "application":"DRIVER", "userId":${this.state.userId}}`);
    };
    
    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };
    
    connection.onmessage = (e) => {
      // {
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
        if (parsedMessage.messageType === "BOOKING_ALERT" && parsedMessage.application === "ADMIN") {
          this.setState({ bookingId: parsedMessage.bookingId});
          this.setState({ clientId: parsedMessage.clientId});
          // this.setState({ clientName: parsedMessage.clientName});
          this.setState({ clientPhoneNumber: parsedMessage.phoneNumber});
          this.setState({ clientAddress: parsedMessage.address });
          this.setState({ isBusy: true});
          console.log(parsedMessage.clientId);
          fetch(`http://localhost:8080/users/detail?userId=${parsedMessage.clientId}`, {
            method: "GET",
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            }
          })
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
            this.setState({ clientName: response.name });
          })
          .catch((err) => {
            console.log(err);
          });
          
        }
    };

    // Submit location
    if (timerId === null) {
      timerId = setInterval(function() {
        // console.log('interval send location');
        // connection.send(JSON.stringify(ref.state));//  `{"lng": ` + 10.121 + `, "lat": ` + 5.12520 + `}`
      }, 2000);
    }

  }

  componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
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

      // fetch("https://localhost:8080/user/location", {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //     accept: "application/json",
    //   },
    //   body: JSON.stringify({
    //     address: this.state.address,
    //     password: this.state.password,
    //   }),
    // })
    //   .then((response) => response.json())
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

  render() {
    return (
      <>
        <div ref={this.wrapper}>
          <Container>
            <Form onSubmit={this.handleSubmit}>
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
                  <div class="ui segment">
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
                  <div class="ui segment">
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
                  </div>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit" primary>Nhận cuốc xe</Button>
                    <Button type="submit" secondary>Hủy cuốc xe</Button>
                    <Button type="submit">Bỏ qua</Button>
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
