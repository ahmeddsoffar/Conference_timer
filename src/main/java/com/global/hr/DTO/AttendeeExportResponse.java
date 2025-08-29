package com.global.hr.DTO;

public class AttendeeExportResponse {
    private String csvContent;
    private String filename;

    public AttendeeExportResponse() {}

    public AttendeeExportResponse(String csvContent, String filename) {
        this.csvContent = csvContent;
        this.filename = filename;
    }

    public String getCsvContent() {
        return csvContent;
    }

    public void setCsvContent(String csvContent) {
        this.csvContent = csvContent;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }
}
