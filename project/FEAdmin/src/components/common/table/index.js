import { useTable } from "react-table";
import {
  Button,
  Table,
  Label
} from "semantic-ui-react";

export default function TableCustom({ columns, data }) {
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable({
    columns,
    data
  });

  return(
    <Table>
        <Table.Header>
          <Table.Row>
            {columns.map(column => (
                <Table.HeaderCell>{column}</Table.HeaderCell>
            ))}
            <Table.HeaderCell style={{textAlign: "center" }}><i className="question circle outline icon" title="Gửi thông tin tài xế cho khách hàng"></i></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((driver, index) => {
            <Table.Row>
            <Table.Cell>
              <Label ribbon>{index}</Label>
            </Table.Cell>
            <Table.Cell>{driver.driverPhoneNumber}</Table.Cell>
            <Table.Cell>{driver.driverName}</Table.Cell>
            <Table.Cell style={{textAlign: "center" }}>
              <Button className="action-btn" onClick={() => console.log(driver.driverId)} circular icon='bullhorn' /></Table.Cell>
          </Table.Row>
          })}
        </Table.Body>
      </Table>
    )
  }