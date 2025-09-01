package com.global.hr.Controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class CorsController {
    
    /**
     * Handle preflight requests for all endpoints
     * This ensures CORS preflight requests are handled properly
     */
    @RequestMapping(method = RequestMethod.OPTIONS, value = "/**")
    public void handlePreflight() {
        // This method intentionally left empty to handle preflight requests
        // The actual CORS headers are set by the CorsConfig
    }
}
