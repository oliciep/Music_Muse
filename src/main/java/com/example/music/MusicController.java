package com.example.music;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MusicController {

	@GetMapping("/")
	public String index() {
		return "Welcome to my Music Application!";
	}

}