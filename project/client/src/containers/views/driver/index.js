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

class Driver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      phoneNumber: "",
      carType: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeCarType = this.handleChangeCarType.bind(this);
    this.wrapper = React.createRef();
  }

  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.agree);
    // creates entity
    fetch("https://localhost:8080/user/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        address: this.state.address,
        password: this.state.password,
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
                pt={3}
              >
                <Grid.Column style={{ maxWidth: 450 }}>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Grid.Column>
                      <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                      <Header as="h4">
                        Xin chào tài xế
                      </Header>
                      <Header as="h4">Bác tài đang ở đây</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Tên bác tài:</label>
                        <label>{this.state.name}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Số điện thoại:</label>
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
                        <label>Loại xe bác tài đang chạy</label>
                        <label>{this.state.carType}</label>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit">Gửi thông tin địa điểm</Button>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "50px 10px 10px 10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Thông tin cuốc xe</label>
                      </Grid.Column>
                      <Grid.Column>
                        <TextArea
                          readOnly={true}
                          value={this.state.book}
                          onChange={this.handleChangeCarType}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Button type="submit">Nhận cuốc xe</Button>
                    <Button type="submit">Hủy cuốc xe</Button>
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
