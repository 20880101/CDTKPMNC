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
    fetch("https://localhost:8080/user/login", {
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
                      <Header as="h3">???ng d???ng ?????t xe - Trang Nguy???n</Header>
                      <Header as="h4">
                        Ch??o m???ng b???n ?????n v???i b???ng ??i???u khi???n.
                      </Header>
                      <Header as="h4">????ng nh???p v??o h??? th???ng qu???n tr??? vi??n</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>T??n ????ng nh???p</label>
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
                        <label>M???t kh???u</label>
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
                      {/* <Checkbox checked={this.state.agree} onChange={this.handleCheck} label="T??i ho??n to??n ?????ng ?? v???i c??c ??i???u kho???n s??? d???ng" /> */}
                    </Form.Field>
                    <Button type="submit">????ng nh???p</Button>
                    <Button type="submit" onClick={this.register}>
                      ????ng k??
                    </Button>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <label>L???y l???i m???t kh???u</label>
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
