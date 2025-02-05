// src/components/DataFilter.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  SelectChangeEvent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import _ from 'lodash';

interface DataFilterProps {
  data: any[];
  onFilterApply: (filteredData: any[]) => void;
}

interface FilterCriteria {
  field: string;
  value: string;
}

const DataFilter: React.FC<DataFilterProps> = ({ data, onFilterApply }) => {
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>({});
  const [filteredResults, setFilteredResults] = useState<any[]>(data);
  const [isFiltered, setIsFiltered] = useState(false);

  // Initialize available fields from data
  useEffect(() => {
    if (data.length > 0) {
      const fields = Object.keys(data[0]);
      setAvailableFields(fields);
      setFilteredResults(data);

      // Calculate unique values for each field
      const valueMap = fields.reduce((acc, field) => {
        acc[field] = _.uniq(data.map(item => item[field])).filter(Boolean);
        return acc;
      }, {} as { [key: string]: any[] });
      setUniqueValues(valueMap);
    }
  }, [data]);

  const handleFieldChange = (event: SelectChangeEvent<string>) => {
    setSelectedField(event.target.value);
    setFilterValue('');
  };

  const handleAddFilter = () => {
    if (selectedField && filterValue) {
      setFilters([...filters, { field: selectedField, value: filterValue }]);
      setSelectedField('');
      setFilterValue('');
    }
  };

  const handleRemoveFilter = (indexToRemove: number) => {
    setFilters(filters.filter((_, index) => index !== indexToRemove));
  };

  const applyFilters = () => {
    const filtered = data.filter(item =>
      filters.every(filter => 
        String(item[filter.field]).toLowerCase().includes(filter.value.toLowerCase())
      )
    );
    setFilteredResults(filtered);
    setIsFiltered(true);
    onFilterApply(filtered);
  };

  const clearFilters = () => {
    setFilters([]);
    setFilteredResults(data);
    setIsFiltered(false);
    onFilterApply(data);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter Data
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>Select Field</InputLabel>
            <Select
              value={selectedField}
              label="Select Field"
              onChange={handleFieldChange}
            >
              {availableFields.map(field => (
                <MenuItem key={field} value={field}>
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>Filter Value</InputLabel>
            {selectedField && uniqueValues[selectedField] ? (
              <Select
                value={filterValue}
                label="Filter Value"
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {uniqueValues[selectedField].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <TextField
                label="Filter Value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            onClick={handleAddFilter}
            disabled={!selectedField || !filterValue}
            fullWidth
            sx={{ height: '56px' }}
          >
            Add Filter
          </Button>
        </Grid>
      </Grid>

      {filters.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.map((filter, index) => (
              <Chip
                key={index}
                label={`${filter.field}: ${filter.value}`}
                onDelete={() => handleRemoveFilter(index)}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={applyFilters}
          disabled={filters.length === 0}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          onClick={clearFilters}
          disabled={filters.length === 0}
        >
          Clear Filters
        </Button>
      </Box>

      {isFiltered && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing {filteredResults.length} of {data.length} total records
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {availableFields.map((field) => (
                <TableCell key={field}>{field}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults.slice(0, 10).map((row, index) => (
              <TableRow key={index}>
                {availableFields.map((field) => (
                  <TableCell key={field}>{row[field]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {filteredResults.length > 10 && (
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Showing first 10 records. Total: {filteredResults.length} records
        </Typography>
      )}
    </Paper>
  );
};

export default DataFilter;