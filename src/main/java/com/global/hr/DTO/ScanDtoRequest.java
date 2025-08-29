package com.global.hr.DTO;

public class ScanDtoRequest {
	public String code;
    public String action; // optional
    public String idempotencyKey; // optional
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getAction() {
		return action;
	}
	public void setAction(String action) {
		this.action = action;
	}
	public String getIdempotencyKey() {
		return idempotencyKey;
	}
	public void setIdempotencyKey(String idempotencyKey) {
		this.idempotencyKey = idempotencyKey;
	}

}
