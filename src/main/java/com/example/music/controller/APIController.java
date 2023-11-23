package com.example.music.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class APIController {

    // Define your REST endpoints here
    @GetMapping("/data")
    public String getData() {
        // Your REST endpoint logic
        return "Some data";
    }
}
