import React from "react";
import {
  Grid,
  Button,
  Form,
  TextArea,
  Select,
  Header,
  Container,
  Table,
  Label
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

class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "101",
      bookingId: "",      
      clientId: "1",
      clientName: "",
      address: "",
      phoneNumber: "",
      carType: "1",
      drivers: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleChangeAddress = this.handleChangeAddress.bind(this);
    // this.handleChangeCarType = this.handleChangeCarType.bind(this);
    this.wrapper = React.createRef();
  }

  // After DOM ready
  componentDidMount() {
    var ref = this;
    connection.onopen = () => {
      connection.send(
        `{"messageType": "REGISTER", "application":"ADMIN", "userId":${this.state.userId}}`
      );
    };

    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    connection.onmessage = (e) => {
      console.log(e.data);
      var parsedMessage = JSON.parse(e.data);
      // {"messageType":"BOOKING","application":"CLIENT","userId":"1","booking":"634ae832bb525b32bc5af14f","address":"1 Lê Duẩn, Quận 1, Hồ Chí Minh"}
      if (parsedMessage.messageType === "BOOKING") {
        console.log(parsedMessage.messageType);
        this.handleBookingMessage(parsedMessage);
      } else if (parsedMessage.messageType === "BOOKING_ACCEPT") {
        this.handleBookingAccept(parsedMessage);
      }
    };

    // Submit location
    if (timerId === null) {
      timerId = setInterval(function () {
        // console.log('interval send location');
        // connection.send(JSON.stringify(ref.state));//  `{"lng": ` + 10.121 + `, "lat": ` + 5.12520 + `}`
      }, 2000);
    }
  }

  handleBookingMessage(parsedMessage) {
    this.setState({ clientId: parsedMessage.userId });
    this.setState({ bookingId: parsedMessage.booking });
    this.setState({ address: parsedMessage.address });
    this.setState({ carType: parsedMessage.carType });
    this.setState({ phoneNumber: parsedMessage.phoneNumber });

    console.log(parsedMessage.userId);
    fetch(`http://localhost:8080/users/detail?userId=${parsedMessage.userId}`, {
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

  handleBookingAccept(parsedMessage) {
      // {
      //   "messageType": "BOOKING_ACCEPT", 
      //   "application": "DRIVER", 
      //   "clientId": "${this.state.clientId}", 
      //   "bookingId": "${this.state.bookingId}",
      //   "driverId": "${this.state.userId}",
      //   "driverName": "${this.state.name}",
      //   "driverPhoneNumber": "${this.state.phoneNumber}"
      //   }
      let driver = {
        "bookingId": parsedMessage.bookingId,
        "driverId" : parsedMessage.driverId,
        "driverName" : parsedMessage.driverName,
        "driverPhoneNumber" : parsedMessage.driverPhoneNumber
      }
      this.state.drivers[parsedMessage.driverId] = driver;
  }

  componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  }

  handleSubmit(event) {
      // update booking status
      // fetch("http://localhost:8080/users/booking-status", {
      //   method: "POST",
      //   headers: {
      //     "content-type": "application/json",
      //     accept: "application/json",
      //   },
      //   body: JSON.stringify({
      //     _id: this.state.bookingId,
      //     finish: "LOCKED",
      //   }),
      // })
      // .then((response) => response.json())
      // .then((response) => {
      //   this.setState({finished: true});
      //   console.log(`got response -> send message ${JSON.stringify(response)}`);
      //   connection.send(`{
      //     "messageType": "BOOKING_ALERT", 
      //     "application": "ADMIN", 
      //     "clientId": "${this.state.clientId}", 
      //     "userName": "${this.state.clientName}"
      //     "booking": "${this.state.bookingId}",
      //     "address": "${this.state.address}",
      //     "phoneNumber": "${this.state.phoneNumber}"
      //     }`);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   })
    
      connection.send(`{
        "messageType": "BOOKING_ALERT", 
        "application": "ADMIN", 
        "clientId": "${this.state.clientId}", 
        "clientName": "${this.state.clientName}",
        "bookingId": "${this.state.bookingId}",
        "address": "${this.state.address}",
        "phoneNumber": "${this.state.phoneNumber}"
        }`);

    // // send message to drivers
    // fetch("https://localhost:8080/user/login", {
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
  }

  handleChangeClientName(event){
    console.log(event.target.value );
    this.setState({ clientName: event.target.value });
  } 
  
  handleChangePhoneNumber(event) {
    console.log(event.target.value );
    this.setState({ phoneNumber: event.target.value });
  }
  
  handleChangeAddress(event) {
    console.log(event.target.value );
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
          <Grid
                textAlign="center"
                style={{ padding: "10px" }}
                verticalAlign="middle"
                pt={3}
              >
                <Grid.Column>
                  <Grid.Row>
                    <Grid.Column>
                      <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                      <Header as="h4">Quản trị viên</Header>
                    </Grid.Column>
                  </Grid.Row>
                </Grid.Column>
            </Grid>
            <Form onSubmit={this.handleSubmit}>
              <Grid
                textAlign="center"
                style={{ height: "90vh", padding: "10px" }}
                verticalAlign="top"
                align="top"
                pt={3}
              >
                <Grid.Column style={{ maxWidth: 550, minWidth:550 }}>
                  <Grid.Row style={{ padding: "10px" }} stretched>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Booking id: </label>
                        <label>{this.state.bookingId}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Khach hang id: </label>
                        <label>{this.state.clientId}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Tên khách hàng: </label>
                      </Grid.Column>
                      <Grid.Column>
                      <input
                          name="clientName"
                          type="text"
                          placeholder="Input client name..."
                          value={this.state.clientName} 
                          onChange={(event)=>this.handleChangeClientName(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Số điện thoại: </label>
                      </Grid.Column>
                      <Grid.Column>
                      <input
                          name="phoneNumber"
                          type="text"
                          placeholder="Input address..."
                          value={this.state.phoneNumber} 
                          onChange={(event)=>this.handleChangePhoneNumber(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Điểm đón: </label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="address"
                          type="text"
                          placeholder="Input address..."
                          value={this.state.address} 
                          onChange={(event)=>this.handleChangeAddress(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Loại xe</label>
                      </Grid.Column>
                      <Grid.Column>
                        <Select
                          style={{ width: "100%" }}
                          options={options}
                          placeholder="Chọn loại xe"
                          value={this.state.carType}
                          onChange={(event)=>this.handleChangeCarType(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit" primary>Điều phối</Button>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "50px 10px 10px 10px" }}>
                  <label>Danh sách tài xế chấp nhận cuốc xe</label>
                    <Table celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>STT</Table.HeaderCell>
                          <Table.HeaderCell>Số điện thoại</Table.HeaderCell>
                          <Table.HeaderCell>Tên tài xế</Table.HeaderCell>
                          <Table.HeaderCell>Biển số xe</Table.HeaderCell>
                          <Table.HeaderCell style={{textAlign: "center" }}><i class="question circle outline icon" title="Gửi thông tin tài xế cho khách hàng"></i></Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {this.state.drivers.forEach(driver => {
                          <Table.Row>
                          <Table.Cell>
                            <Label ribbon>1</Label>
                          </Table.Cell>
                          <Table.Cell>{driver.driverPhoneNumber}</Table.Cell>
                          <Table.Cell>{driver.driverName}</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell style={{textAlign: "center" }}>
                            <Button className="action-btn" onClick={() => console.log(driver.driverId)} circular icon='bullhorn' /></Table.Cell>
                        </Table.Row>
                        })}
                      </Table.Body>
                    </Table>
                  </Grid.Row>
                </Grid.Column>
                <Grid.Column style={{ maxWidth: 550, minWidth:550, textAlign: "left" }}>
                  <Grid.Row style={{ padding: "10px"}}>
                    <label>Danh sách 5 điểm đón nhiều nhất</label>
                    <Table celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>STT</Table.HeaderCell>
                          <Table.HeaderCell>Địa điểm đón</Table.HeaderCell>
                          <Table.HeaderCell style={{textAlign: "center" }}><i class="question circle outline icon" title="Điền thông tin vào biểu mẫu"></i></Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <Label ribbon>1</Label>
                          </Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell style={{textAlign: "center" }}><Button className="action-btn" onClick={() => console.log("data._id")} circular icon='edit' /></Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <Label ribbon>1</Label>
                          </Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell style={{textAlign: "center" }}><Button className="action-btn" onClick={() => console.log("data._id")} circular icon='edit' /></Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <label>Danh sách 5 cuốc xe gần nhất</label>
                    <Table celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>STT</Table.HeaderCell>
                          <Table.HeaderCell>Địa điểm đón</Table.HeaderCell>
                          <Table.HeaderCell style={{textAlign: "center" }}><i class="question circle outline icon" title="Điền thông tin vào biểu mẫu"></i></Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <Label ribbon>1</Label>
                          </Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell style={{textAlign: "center" }}><Button className="action-btn" onClick={() => console.log("data._id")} circular icon='edit' /></Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
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

export default AdminDashboard;
