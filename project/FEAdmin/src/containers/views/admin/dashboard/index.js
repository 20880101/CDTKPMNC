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
  Label,
} from "semantic-ui-react";
import DataTable from "react-data-table-component";

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

const customStyles = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      border: "2px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px", // override the cell padding for head cells
      paddingRight: "8px",
      fontWeight: "1.5em",
      backgroundColor: "grey",
      border: "1px",
      fontWeight: "bold",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px", // override the cell padding for data cells
      paddingRight: "8px",
      backgroundColor: "lightgrey",
    },
  },
};

const driverTableColumns = [
  {
    name: "Số ĐT",
    selector: (row) => row.driverPhoneNumber,
  },
  {
    name: "Tên tài xế",
    selector: (row) => row.driverName,
  },
  {
    name: "Điều xe",
    button: true,
    cell: (row) => (
      <button
        type="button"
        className="primary"
        onClick={(event) => handleSelectDriver(row)}
      >
        Chọn
      </button>
    ),
  },
];

function handleSelectDriver(row) {
  console.log(row.driverName);
  var message = `{
    "clientId": "${row.clientId}",
    "bookingId": "${row.bookingId}",
    "driverId": "${row.driverId}",
    "driverName": "${row.driverName}",
    "driverPhoneNumber": "${row.driverPhoneNumber}",
    "messageType": "CONFIRM_BOOKING_ACCEPT",
    "application": "ADMIN"
  }`;
  connection.send(message);
}

const topAddressTableColumns = [
  {
    name: "Địa điểm đón",
    selector: (row) => row.clientAddress,
  },
  {
    name: "Điền vào form",
    button: true,
    cell: () => (
      <button type="button" className="primary">
        Chọn
      </button>
    ),
  },
];

const lastBookingTableColumns = [
  {
    name: "Địa điểm đón",
    selector: (row) => row.clientAddress,
  },
  {
    name: "Điền vào form",
    button: true,
    cell: () => (
      <button type="button" className="primary">
        Chọn
      </button>
    ),
  },
];

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
      drivers: [],
      top5Addresses: [],
      last5Addresses: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDriversChange = this.handleDriversChange.bind(this);
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
      },
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
    // sample received message{
    //   "messageType": "BOOKING_ACCEPT",
    //   "application": "DRIVER",
    //   "clientId": "${this.state.clientId}",
    //   "bookingId": "${this.state.bookingId}",
    //   "driverId": "${this.state.userId}",
    //   "driverName": "${this.state.name}",
    //   "driverPhoneNumber": "${this.state.phoneNumber}"
    //   }
    let driver = {
      clientId: parsedMessage.clientId,
      bookingId: parsedMessage.bookingId,
      driverId: parsedMessage.driverId,
      driverName: parsedMessage.driverName,
      driverPhoneNumber: parsedMessage.driverPhoneNumber,
    };
    let newList = [...this.state.drivers];
    newList.push(driver);
    this.handleDriversChange(newList);
  }

  componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  }

  handleDriversChange(drivers) {
    this.setState({ drivers: drivers });
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
    //     "clientName": "${this.state.clientName}"
    //     "bookingId": "${this.state.bookingId}",
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
  }

  handleChangeClientName(event) {
    console.log(event.target.value);
    this.setState({ clientName: event.target.value });
  }

  handleChangePhoneNumber(event) {
    console.log(event.target.value);
    this.setState({ phoneNumber: event.target.value });
  }

  handleChangeAddress(event) {
    console.log(event.target.value);
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
                <Grid.Column style={{ maxWidth: 550, minWidth: 550 }}>
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
                          onChange={(event) =>
                            this.handleChangeClientName(event)
                          }
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
                          onChange={(event) =>
                            this.handleChangePhoneNumber(event)
                          }
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
                          onChange={(event) => this.handleChangeAddress(event)}
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
                          onChange={(event) => this.handleChangeCarType(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit" primary>
                      Điều phối
                    </Button>
                  </Grid.Row>

                  <Grid.Row
                    style={{
                      padding: "50px 10px 10px 10px",
                      textAlign: "left",
                    }}
                  >
                    <label>Danh sách tài xế chấp nhận cuốc xe:</label>
                    <p />
                    <DataTable
                      columns={driverTableColumns}
                      data={this.state.drivers}
                      noDataComponent="Chưa có dữ liệu"
                      customStyles={customStyles}
                    />
                  </Grid.Row>
                </Grid.Column>
                <Grid.Column
                  style={{ maxWidth: 550, minWidth: 550, textAlign: "left" }}
                >
                  <Grid.Row style={{ padding: "10px" }}>
                    <label>Danh sách 5 điểm đón nhiều nhất:</label>+
                    <p />
                    <DataTable
                      columns={topAddressTableColumns}
                      data={this.state.top5Addresses}
                      noDataComponent="Chưa có dữ liệu"
                      customStyles={customStyles}
                    />
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px", textAlign: "left" }}>
                    <label>Danh sách 5 cuốc xe gần nhất:</label>
                    <p />
                    <DataTable
                      columns={lastBookingTableColumns}
                      data={this.state.last5Addresses}
                      noDataComponent="Chưa có dữ liệu"
                      customStyles={customStyles}
                    />
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
