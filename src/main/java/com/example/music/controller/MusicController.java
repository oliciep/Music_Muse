package com.example.music.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Controller
public class MusicController {

    @GetMapping("/")
    @ResponseBody
    public String index() throws IOException {
        return new String(Files.readAllBytes(Paths.get("src/main/resources/static/index.html")));
    }
}