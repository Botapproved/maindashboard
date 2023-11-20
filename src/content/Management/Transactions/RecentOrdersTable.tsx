import { FC, ChangeEvent, useState } from 'react';
import { format } from 'date-fns';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import {
  Tooltip,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  Typography,
  useTheme,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button
} from '@mui/material';

import Label from '@/components/Label';
import { CryptoOrder, CryptoOrderStatus } from '@/models/crypto_order';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ForumIcon from '@mui/icons-material/Forum';
import BulkActions from './BulkActions';
import axios from '@/config/axiosConfig';
import { id } from 'date-fns/locale';

interface RecentOrdersTableProps {
  className?: string;
  cryptoOrders: CryptoOrder[];
}

interface Filters {
  status?: CryptoOrderStatus;
}

const getStatusLabel = (cryptoOrderStatus: CryptoOrderStatus): JSX.Element => {
  const map = {
    Completed: {
      text: 'Completed',
      color: 'success'
    },
    "In-Progress": {
      text: 'In-Progress',
      color: 'warning'
    },
    Pending: {
      text: 'Pending',
      color: 'error'
    }
  };

  const { text, color }: any = map[cryptoOrderStatus ?? "Pending"];

  return <Label color={color}>{text}</Label>;
};

const applyFilters = (
  cryptoOrders: CryptoOrder[],
  filters: Filters
): CryptoOrder[] => {
  return cryptoOrders.filter((cryptoOrder) => {
    let matches = true;

    if (filters.status && cryptoOrder.status !== filters.status) {
      matches = false;
    }

    return matches;
  });
};

const applyPagination = (
  cryptoOrders: CryptoOrder[],
  page: number,
  limit: number
): CryptoOrder[] => {
  return cryptoOrders.slice(page * limit, page * limit + limit);
};

const RecentOrdersTable: FC<RecentOrdersTableProps | any> = ({ cryptoOrders, setRefetch }) => {
  const [selectedCryptoOrders, setSelectedCryptoOrders] = useState<string[]>(
    []
  );
  const selectedBulkActions = selectedCryptoOrders.length > 0;
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [filters, setFilters] = useState<Filters>({
    status: null
  });
  const [modalOpen, setModalOpen] = useState<null | string>(null);
  const [formValues,setFormValues] = useState({
    grant: "", 
    description: "",
  })
  const statusOptions = [
    {
      id: 'all',
      name: 'All'
    },
    {
      id: 'completed',
      name: 'Completed'
    },
    {
      id: 'pending',
      name: 'Pending'
    },
    {
      id: 'failed',
      name: 'Failed'
    }
  ];

  const handleStatusChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let value = null;

    if (e.target.value !== 'all') {
      value = e.target.value;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      status: value
    }));
  };

  const handleSelectAllCryptoOrders = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedCryptoOrders(
      event.target.checked
        ? cryptoOrders.map((cryptoOrder) => cryptoOrder.id)
        : []
    );
  };

  const handleSelectOneCryptoOrder = (
    _event: ChangeEvent<HTMLInputElement>,
    cryptoOrderId: string
  ): void => {
    if (!selectedCryptoOrders.includes(cryptoOrderId)) {
      setSelectedCryptoOrders((prevSelected) => [
        ...prevSelected,
        cryptoOrderId
      ]);
    } else {
      setSelectedCryptoOrders((prevSelected) =>
        prevSelected.filter((id) => id !== cryptoOrderId)
      );
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredCryptoOrders = applyFilters(cryptoOrders, filters);
  const paginatedCryptoOrders = applyPagination(
    filteredCryptoOrders,
    page,
    limit
  );
  const selectedSomeCryptoOrders =
    selectedCryptoOrders.length > 0 &&
    selectedCryptoOrders.length < cryptoOrders.length;
  const selectedAllCryptoOrders =
    selectedCryptoOrders.length === cryptoOrders.length;
  const theme = useTheme();

  const updateReportStatus = async (reportId) => {
    try {
      const result = cryptoOrders.find((item) => item.id === reportId);
      if(result.status == "Pending"){
        await axios.put(`/update_report_status/${reportId}`, { status: 'In-Progress' });
      }
      else{
        await axios.put(`/update_report_status/${reportId}`, { status: 'Pending' });
      }
  
      setSelectedCryptoOrders((prevSelectedCryptoOrders) =>
        prevSelectedCryptoOrders.map((id) => (id === reportId ? 'In-Progress' : id))
      );
      toast.success("Successfully updated the report Status!");
      setRefetch(prev => !prev);
    } catch (error) {
      toast.error("Error updating the report Status!");
      console.error('Error updating report status:', error);
    }
  };

  const deleteReport = async (reportId) => {
    try{
      await axios.delete(`/delete_report/${reportId}`);
      toast.success("Successfully Completed the Report Status!");
      setRefetch(prev => !prev);
    } catch (error){
      toast.error("Error deleting the Report!");
      console.error('Error updating report status:', error);
    }

  };
  
  return (
    <Card>
      {selectedBulkActions && (
        <Box flex={1} p={2}>
          <BulkActions />
        </Box>
      )}
      {!selectedBulkActions && (
        <CardHeader
          action={
            <Box width={150}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || 'all'}
                  onChange={handleStatusChange}
                  label="Status"
                  autoWidth
                >
                  {statusOptions.map((statusOption) => (
                    <MenuItem key={statusOption.id} value={statusOption.id}>
                      {statusOption.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          }
          title="Recent Reports"
        />
      )}
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAllCryptoOrders}
                  indeterminate={selectedSomeCryptoOrders}
                  onChange={handleSelectAllCryptoOrders}
                />
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>District</TableCell>
              <TableCell align="right">Station</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCryptoOrders.map((cryptoOrder) => {
              const isCryptoOrderSelected = selectedCryptoOrders.includes(
                cryptoOrder.id
              );
              return (
                <TableRow
                  hover
                  key={cryptoOrder.id}
                  selected={isCryptoOrderSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isCryptoOrderSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneCryptoOrder(event, cryptoOrder.id)
                      }
                      value={isCryptoOrderSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {cryptoOrder.orderDetails}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" noWrap>
                      {cryptoOrder.orderDate}
                    </Typography> */}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {cryptoOrder.orderDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {cryptoOrder.sourceName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cryptoOrder.sourceDesc}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >{/* 
                      {cryptoOrder.amountCrypto} */}
                      {cryptoOrder.cryptoCurrency}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" noWrap>
                      {numeral(cryptoOrder.amount).format(
                        `${cryptoOrder.currency}0,0.00`
                      )}
                    </Typography> */}
                  </TableCell>
                  <TableCell align="right">
                    {getStatusLabel(cryptoOrder.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Report" arrow>
                      <IconButton
                        sx={{
                          '&:hover': {
                            background: theme.colors.primary.lighter
                          },
                          color: theme.palette.primary.main
                        }}
                        color="inherit"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          updateReportStatus(cryptoOrder.id);
                        }}
                      >
                        <EditTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Report" arrow>
                      <IconButton
                        sx={{
                          '&:hover': { background: theme.colors.error.lighter },
                          color: theme.palette.error.main
                        }}
                        color="inherit"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteReport(cryptoOrder.id);
                        }}
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {cryptoOrder.status !== "Completed" && <Tooltip title="Add To Forum" arrow>
                      <IconButton
                        sx={{
                          '&:hover': { background: theme.colors.primary.lighter },
                          color: theme.palette.primary.main
                        }}
                        color="inherit"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          setModalOpen(cryptoOrder.id);
                        }}
                      >
                        <ForumIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={filteredCryptoOrders.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 30]}
        />
      </Box>
      <Dialog onClose={() => setModalOpen(null)} open={!!modalOpen} fullWidth>
            <DialogTitle>
              <Typography variant="h3">
                Add to forum
              </Typography>
            </DialogTitle>
            <DialogContent>
              <form onSubmit={async e => {
                e.preventDefault()
                try {
                  const res = await axios.post(`/add_to_forum/${modalOpen}`, formValues);
                  toast.success(res.data.message);
                  setRefetch(prev => !prev);
                  setModalOpen(null);
                } catch(err) {
                  toast.error("Failed to add to forum.")
                }
              }}>
                <Stack spacing={2} m={2}>
                  <TextField 
                    required 
                    label="Description"  
                    variant="outlined" 
                    value={formValues.description} 
                    onChange={e => setFormValues(prev => ({...prev, description: e.target.value}))}
                  />
                  <TextField 
                    required 
                    label="Grant"  
                    variant="outlined" 
                    value={formValues.grant} 
                    onChange={e => setFormValues(prev => ({...prev, grant: e.target.value}))}
                  />
                  <Button variant="contained" type="submit">Submit</Button>
                </Stack>
              </form>
            </DialogContent>
      </Dialog>
    </Card>
  );
};

RecentOrdersTable.propTypes = {
  cryptoOrders: PropTypes.array.isRequired
};

RecentOrdersTable.defaultProps = {
  cryptoOrders: []
};

export default RecentOrdersTable;
