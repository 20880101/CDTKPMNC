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
import DataTable from "react-data-table-component";

// https://www.npmjs.com/package/react-geocode
Geocode.setApiKey("AIzaSyCRwKDRudmnflj_-cxiDgY3amDog-W8zmk");
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

class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "101",
      bookingId: "",
      clientId: "",
      clientName: "",
      address: "",
      lng: undefined,
      lat: undefined,
      phoneNumber: "",
      carType: "",
      distance: "5",
      drivers: [],
      top5Addresses: [],
      last5Addresses: [],
      bookingCancelledByDriver: false,
      meetDriver: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDriversChange = this.handleDriversChange.bind(this);
    // this.handleChangeCarType = this.handleChangeCarType.bind(this);
    this.handleChangeDistance = this.handleChangeDistance.bind(this);
    this.seachCustomer = this.seachCustomer.bind(this);
    this.loadUserNameByPhone = this.loadUserNameByPhone.bind(this);
    this.wrapper = React.createRef();
  }

  
  lastBookingTableColumns = [
    {
      name: "Địa điểm đón",
      selector: (row) => row.address,
    },
    {
      name: "Điền vào form",
      button: true,
      cell: (row) => (
        <button
          type="button"
          className="primary"
          onClick={(event) => this.handleAddress(row)}
        >
          Chọn
        </button>
      ),
    },
  ];

  topAddressTableColumns = [
    {
      name: "Địa điểm đón",
      selector: (row) => row.address,
    },
    {
      name: "Điền vào form",
      button: true,
      cell: (row) => (
        <button
          type="button"
          className="primary"
          onClick={(event) => this.handleAddress(row)}
        >
          Chọn
        </button>
      ),
    },
  ];

  handleAddress = (row) => {
    console.log(row.address);
    this.setState({address: row.address});
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
        this.loadDataOfUser(parsedMessage.phoneNumber);
      } else if (parsedMessage.messageType === "BOOKING_ACCEPT") {
        this.handleBookingAccept(parsedMessage);
      } else if (
        parsedMessage.messageType === "BOOKING_CANCELED" &&
        parsedMessage.application === "DRIVER") {
        this.state.setState({ bookingCancelledByDriver: true });
        let newList = [];
        this.state.drivers.forEach((driver) => {
          if (driver.driverId !== parsedMessage.driverId) {
            newList.push(driver);
          }
        })
        this.handleDriversChange(newList);
      } else if (parsedMessage.messageType === 'MEET_CLIENT') {
        this.setState({ meetDriver: true });
      }
    };

    // Submit location
    // if (timerId === null) {
    //   timerId = setInterval(function () {
    //     // console.log('interval send location');
    //     // connection.send(JSON.stringify(ref.state));//  `{"lng": ` + 10.121 + `, "lat": ` + 5.12520 + `}`
    //   }, 2000);
    // }
  }

  handleBookingMessage(parsedMessage) {
    this.setState({ clientId: parsedMessage.userId });
    this.setState({ bookingId: parsedMessage.booking });
    this.setState({ address: parsedMessage.address });
    this.setState({ carType: parsedMessage.carType });
    this.setState({ phoneNumber: parsedMessage.phoneNumber });
    this.setState({ lng: parsedMessage.lng});
    this.setState({ lat: parsedMessage.lat});

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
        this.setState({drivers: []});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  loadUserNameByPhone(phoneNumber) {
    console.log(phoneNumber);
    fetch(`http://localhost:8080/users/detail?phoneNumber=${phoneNumber}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response?.name) {
          this.setState({ clientName: response.name });
          this.setState({ clientId: response.userId });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  loadDataOfUser(phoneSearch) {
    console.log(phoneSearch);
    // top5Addresses
    fetch(
      `http://localhost:8080/users/bookings-top5Addresses?phoneNumber=${phoneSearch}`,
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
        let newList = [];
        response.forEach((booking) => {
          let address = {
            address: booking._id.address,
          };
          newList.push(address);
        });
        this.setState({ top5Addresses: newList });
      })
      .catch((err) => {
        console.log(err);
      });

    // last5Addresses
    fetch(
      `http://localhost:8080/users/bookings-last5Addresses?phoneNumber=${phoneSearch}`,
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
        let newList = [];
        response.forEach((booking) => {
          let address = {
            userId: booking.userId,
            bookingId: booking.bookingId,
            address: booking.address,
          };
          newList.push(address);
        });
        this.setState({ last5Addresses: newList });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleBookingAccept(parsedMessage) {
    let driver = {
      clientId: parsedMessage.clientId,
      bookingId: parsedMessage.bookingId,
      driverId: parsedMessage.driverId,
      driverName: parsedMessage.driverName,
      driverPhoneNumber: parsedMessage.driverPhoneNumber,
    };
    let newList = [...this.state.drivers];
    let foundDriver = false;
    this.state.drivers.forEach(d => 
      {
        if (d.driverId === driver.driverId && d.bookingId === driver.bookingId) {
            foundDriver = true
        }
      }
    );
    if (foundDriver === false) {
      newList.push(driver);
      this.handleDriversChange(newList);
    }
  }

  handleDriversChange(drivers) {
    this.setState({ drivers: drivers });
  }

  componentWillUnmount() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  }

  seachCustomer(event) {
    this.loadDataOfUser(this.state.phoneNumber);
    this.loadUserNameByPhone(this.state.phoneNumber);
  }

  handleSubmit(event) {
    if (this.state.bookingId === "") {
       // create booking if it is creating by admin       
      Geocode.fromAddress(this.state.address).then(
        (response) => {
          const { lat, lng } = response.results[0].geometry.location;
          console.log(lng, lat);
          this.state.lng = lng;
          this.state.lat = lat;

          // update user location and create new booking
          this.updateUserLocationAndCreateNewBooking();
      });
    } else {
      this.updateBookingStatusAndSendAlert();
    }
  }

  updateUserLocationAndCreateNewBooking() {
    console.log('update current location');
        fetch("http://localhost:8080/users/location", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            userId: this.state.clientId,
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
            userId: this.state.clientId,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            lng: this.state.lng,
            lat: this.state.lat,
            carType: this.state.carType,
            status: 'LOCKED'
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(`got response -> send message ${JSON.stringify(response)}`);
            this.state.bookingId = response._id;
            this.setState({ finished: true });
            console.log(`got response -> send message ${JSON.stringify(response)}`);
            connection.send(`{
              "messageType": "BOOKING_ALERT",
              "application": "ADMIN",
              "clientId": "${this.state.clientId}",
              "clientName": "${this.state.clientName}",
              "bookingId": "${this.state.bookingId}",
              "address": "${this.state.address}",
              "phoneNumber": "${this.state.phoneNumber}",
              "distance": ${this.state.distance},
              "lng": ${this.state.lng},
              "lat": ${this.state.lat}
            }`);
          })
          .catch((err) => {
            console.log(err);
          });
  }

  updateBookingStatusAndSendAlert() {
    // update booking status
    fetch("http://localhost:8080/users/booking-status", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        userId: this.state.clientId,
        _id: this.state.bookingId,
        status: "LOCKED",
      }),
    })
    .then((response) => response.json())
    .then((response) => {
      this.setState({ finished: true });
      console.log(`got response -> send message ${JSON.stringify(response)}`);
      connection.send(`{
        "messageType": "BOOKING_ALERT",
        "application": "ADMIN",
        "clientId": "${this.state.clientId}",
        "clientName": "${this.state.clientName}",
        "bookingId": "${this.state.bookingId}",
        "address": "${this.state.address}",
        "phoneNumber": "${this.state.phoneNumber}",
        "distance": ${this.state.distance},
        "lng": ${this.state.lng},
        "lat": ${this.state.lat}
      }`);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handleChangeClientName(event) {
    this.setState({ clientName: event.target.value });
  }

  handleChangePhoneNumber(event) {
    this.setState({ phoneNumber: event.target.value });
  }

  handleChangeAddress(event) {
    this.setState({ address: event.target.value });
  }

  handleChangeCarType(event, value) {
    this.setState({ carType: value.value });
  }

  handleChangeDistance(event) {
    this.setState({ distance: event.target.value });
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
            <Form>
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
                          placeholder="Tên khách hàng..."
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
                          placeholder="Số điện thoại khách hàng..."
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
                          placeholder="Địa chỉ khách hàng..."
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
                          onChange={(event, value) =>
                            this.handleChangeCarType(event, value)
                          }
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Khoảng cách (km)</label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="distance"
                          type="text"
                          placeholder="Khoảng cách từ khách hàng đến tài xế..."
                          value={this.state.distance}
                          onChange={(event) => this.handleChangeDistance(event)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit" primary onClick={this.handleSubmit}>
                      Điều phối
                    </Button>
                    <Button
                      type="submit"
                      secondary
                      onClick={this.seachCustomer}
                    >
                      Tìm theo Số điện thoại
                    </Button>
                  </Grid.Row>

                  <Grid.Row
                    style={{
                      padding: "50px 10px 10px 10px",
                      textAlign: "left",
                    }}
                  >
                    {this.state.bookingCancelledByDriver === false ? (
                      ""
                    ) : (
                      <div>
                        <p>
                          Tài xế hủy cuốc xe, vui lòng chọn tài xế khác đón
                          khách
                        </p>
                        <p />
                      </div>
                    )}
                    <label style={{color: 'red'}}>
                    {
                      this.state.meetDriver === true ? "Tài xế đã đến nơi" : ""
                    }
                    </label>
                    <br/>
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
                    <label>Danh sách 5 điểm đón nhiều nhất:</label>
                    <p />
                    <DataTable
                      columns={this.topAddressTableColumns}
                      data={this.state.top5Addresses}
                      noDataComponent="Chưa có dữ liệu"
                      customStyles={customStyles}
                    />
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px", textAlign: "left" }}>
                    <label>Danh sách 5 cuốc xe gần nhất:</label>
                    <p />
                    <DataTable
                      columns={this.lastBookingTableColumns}
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
