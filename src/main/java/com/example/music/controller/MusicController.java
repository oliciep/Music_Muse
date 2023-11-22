package com.example.music.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MusicController {

	@RequestMapping(value = "/")
	public String index() {
		return "forward:/index.html";
	}

}