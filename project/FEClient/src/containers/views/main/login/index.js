import React, {useState} from "react";
import { Grid, Button, Form, Header, Container } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("123456789");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  localStorage.setItem("authenticated", "");
  localStorage.setItem("userId", "");
  localStorage.setItem("name", "");
  localStorage.setItem("phoneNumber", "");
  localStorage.setItem("role", "");
  localStorage.setItem("activated", "");

  const handleSubmit = (event) => {
    fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response.error === undefined) {
          localStorage.setItem("authenticated", response.id);
          localStorage.setItem("userId", response.userId);
          localStorage.setItem("name", response.name);
          localStorage.setItem("phoneNumber", response.phoneNumber);
          localStorage.setItem("role", response.role);
          localStorage.setItem("activated", response.activated);

          setUserId(response.userId);

          navigate("/user");
        } else {
          setError(response.error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const register = (event) => {}

    return (
      <>
        <div>
          <Container>
            <Form>
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
                        Ch??ng t??i r???t h??n h???nh ???????c ph???c v???.
                      </Header>
                      <Header as="h4">????ng nh???p v??o h??? th???ng d??nh cho ng?????i d??ng</Header>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>{error}</label>
                      </Grid.Column>
                      <Grid.Column>
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      <Grid.Column align="left">
                        <label>S??? ??i???n tho???i ????ng nh???p</label>
                      </Grid.Column>
                      <Grid.Column>
                        <input
                          name="phoneNumber"
                          type="text"
                          placeholder="123456789"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Grid.Column>
                    </Form.Field>
                  </Grid.Row>
                  <Grid.Row style={{ padding: "10px" }}>
                    <Form.Field>
                      {/* <Checkbox checked={this.state.agree} onChange={this.handleCheck} label="T??i ho??n to??n ?????ng ?? v???i c??c ??i???u kho???n s??? d???ng" /> */}
                    </Form.Field>
                    <Button type="submit" onClick={handleSubmit}>????ng nh???p</Button>
                    <Button type="submit" onClick={register}>
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

  export default Login;