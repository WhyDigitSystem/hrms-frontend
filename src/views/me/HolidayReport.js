import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import DownloadIcon from '@mui/icons-material/Download';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

const HolidayReport = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchName, setBranchName] = useState(localStorage.getItem('branchName'));
  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    getAllHolidayByOrgId();
  }, []);

  // In your getAllHolidayByOrgId function
  const getAllHolidayByOrgId = useCallback(async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);

      const holidays = result?.paramObjectsMap?.holidayVO || [];

      const reversedHolidays = [...holidays] // Optional: if you want latest first
      setListViewData(reversedHolidays);

      if (reversedHolidays.length > 0 && reversedHolidays[0].branchName) {
        setBranchName(reversedHolidays[0].branchName);
      }

    } catch (err) {
      console.error('Error fetching data:', err);

      toast.error(`Failed to fetch holiday data: ${err?.message || 'Unknown error'}`);

      // Optional fallback
      setListViewData([]);
    }
  }, [orgId]);



  useEffect(() => {
    getAllHolidayByOrgId();
  }, [getAllHolidayByOrgId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleDownloadPDF = () => {
    if (!listViewData || listViewData.length === 0) {
      toast.error("No holidays available to download.");
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Holiday List", 105, 15, { align: "center" });

      const branch = listViewData.length > 0 ? listViewData[0].branchName : branchName;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Branch: ${branch}`, 105, 22, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${formatDate(new Date())}`, 105, 29, { align: "center" });

      const headers = [["No.", "Date", "Day", "Holidays"]];
      const data = listViewData.map((item, index) => [
        index + 1,
        formatDate(item.holidayDate),
        item.day || "N/A",
        item.festival || "N/A",
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 40,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [63, 81, 181], textColor: 255, fontSize: 10, halign: "center" },
        columnStyles: { 0: { cellWidth: 10, halign: "center" } },
      });

      doc.save("holidays_report.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Date', size: 140 },
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Holidays', size: 140 },
  ];

  return (
    <>
      <Card sx={{ padding: 4, backgroundColor: '#ffffff', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)', borderRadius: 4, maxWidth: '100%', mt: 3 }}>
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Holiday Report - {branchName ? branchName : "No branch available"} - Branch
          </Typography>
          {/* 
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            sx={{ background: '#4caf50', color: '#fff' }}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button> */}
          <ActionButton title="Download" icon={DownloadIcon} onClick={handleDownloadPDF} margin="0 10px 0 10px" />
        </Box>
        <Box sx={{ mt: 4 }}>
          {listViewData.length > 1 && (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit
                showActions={false}
                hideActions
              />
            </Paper>
          )}
        </Box>
      </Card>
    </>
  );
};

export default HolidayReport;