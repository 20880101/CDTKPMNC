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

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: null,
      name: "Nguyen Thi Thuy Trang",
      phoneNumber: "123456",
      address: "",
      carType: "1",
      driver: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeCarType = this.handleChangeCarType.bind(this);
    this.wrapper = React.createRef();
  }

  handleSubmit(event) {
    const url = "ws://localhost:8080/websocket";
    const connection = new WebSocket(url);
    connection.onopen = () => {
      connection.send("Message From Client");
    };
    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };
    connection.onmessage = (e) => {
      console.log(e.data);
    };

    // alert('A name was submitted: ' + this.state.agree);
    // creates entity
    fetch("http://localhost:8080/users/booking", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        userId: this.state.userId,
        address: this.state.address,
        carType: this.state.carType,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleChangeAddress(event) {
    this.setState({ address: event.target.value });
  }

  handleChangeCarType(event) {
    console.log(event.target.value);
    this.setState({ carType: event.target.value });
  }

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
                columns={1}
              >
                <Grid.Column style={{ maxWidth: 450 }}>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Grid.Column>
                      <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                      <Header as="h4">
                        Chúng tôi rất hân hạnh được phục vụ.
                      </Header>
                      <Header as="h4">Đặt xe</Header>
                    </Grid.Column>
                  </Grid.Row>
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
                          placeholder="Chọn loại xe"
                          selected={this.state.carType}
                          onChange={this.handleChangeCarType}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit">Gọi xe</Button>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "50px 10px 10px 10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Thông tin tài xế</label>
                      </Grid.Column>
                      <Grid.Column>
                        <TextArea readOnly={true} value={this.state.driver} />
                      </Grid.Column>
                    </Form.Field>
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

export default User;
