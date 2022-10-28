import React from "react";
import { Grid, Button, Form, Header, Container } from "semantic-ui-react";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      agree: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeUserName = this.handleChangeUserName.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.wrapper = React.createRef();
  }

  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.username);
    // alert('A name was submitted: ' + this.state.password);
    // alert('A name was submitted: ' + this.state.agree);
    // creates entity
    fetch("http://localhost:8080/user/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        username: this.state.username,
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

  register() {}

  handleChangeUserName(event) {
    this.setState({ username: event.target.value });
  }

  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  }

  handleCheck(event) {
    this.setState({ agree: !event.target.value });
  }

  render() {
    return (
      <>
        <div ref={this.wrapper}>
          <Container>
            <Form onSubmit={this.handleSubmit}>
              <Grid
                textAlign="center"
                style={{ height: "90vh" }}
                verticalAlign="middle"
              >
                <Grid.Column style={{ maxWidth: 450 }} columns={2}>
                  <Grid.Row>
                    <Grid.Column>
                      <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                      <Header as="h4">
                        Chúng tôi rất hân hạnh được phục vụ.
                      </Header>
                      <Header as="h4">Đăng nhập vào hệ thống dành cho tài xế</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Tên đăng nhập</label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="username"
                          type="text"
                          placeholder="trangnguyen"
                          value={this.state.username}
                          onChange={this.handleChangeUserName}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>Mật khẩu</label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="password"
                          type="password"
                          value={this.state.password}
                          onChange={this.handleChangePassword}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      {/* <Checkbox checked={this.state.agree} onChange={this.handleCheck} label="Tôi hoàn toàn đồng ý với các điều khoản sử dụng" /> */}
                    </Form.Field>
                    <Button type="submit">Đăng nhập</Button>
                    <Button type="submit" onClick={this.register}>
                      Đăng ký
                    </Button>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <label>Lấy lại mật khẩu</label>
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

export default Login;
