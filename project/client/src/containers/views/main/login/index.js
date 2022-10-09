import React from "react";
import {
  Grid,
  Button,
  Checkbox,
  Form,
  TextArea,
  Select,
  Header,
  Container,
} from "semantic-ui-react";

function Login() {
  return (
    <>
      <Container>
        <Form>
          <Grid
            textAlign="center"
            style={{ height: "90vh" }}
            verticalAlign="middle"
          >
            <Grid.Column style={{ maxWidth: 450 }} columns={2} padded>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Ứng dụng đặt xe - Trang Nguyễn</Header>
                  <Header as="h4">Chúng tôi rất hân hạnh được phục vụ.</Header>
                  <Header as="h4">Đăng nhập vào hệ thống</Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row color="green" key="green">
                <Form.Field>
                  <Grid.Column align="left">
                    <label>Số điện thoại</label>
                  </Grid.Column>
                  <Grid.Column>
                    <input placeholder="0904081111" />
                  </Grid.Column>
                </Form.Field>
              </Grid.Row>
              <Grid.Row>
                <Form.Field>
                  <Grid.Column align="left">
                    <label>Mật khẩu</label>
                  </Grid.Column>
                  <Grid.Column>
                    <input type="password" />
                  </Grid.Column>
                </Form.Field>
              </Grid.Row>
              <Grid.Row>
                <Form.Field>
                  <Checkbox label="Tôi hoàn toàn đồng ý với các điều khoản sử dụng" />
                </Form.Field>
              </Grid.Row>
              <Button type="submit" onClick="login()">Đăng nhập</Button>
              <Button type="submit">Đăng ký</Button>
              <Form.Field>
                <label>Lấy lại mật khẩu</label>
              </Form.Field>
            </Grid.Column>
          </Grid>
        </Form>
      </Container>
    </>
  );
}
export default Login;
