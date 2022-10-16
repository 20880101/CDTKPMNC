import React from "react";
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
        this.setState({ clientId: parsedMessage.userId });
        // this.setState({ clientName: parsedMessage.clientName });
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
    };

    // Submit location
    if (timerId === null) {
      timerId = setInterval(function () {
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
        

    // // alert('A name was submitted: ' + this.state.agree);
    // // creates entity
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
                      <Header as="h4">Quản trị viên</Header>
                      <Header as="h4">Bảng điều phối</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
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
                    <Button type="submit">Điều phối</Button>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "50px 10px 10px 10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Thông tin tài xế</label>
                      </Grid.Column>
                      <Grid.Column>
                        <TextArea
                          readOnly={true}
                          value={this.state.driiver}
                          onChange={this.handleChangeCarType}
                        />
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

export default AdminDashboard;
