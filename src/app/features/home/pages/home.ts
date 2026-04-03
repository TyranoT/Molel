import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from 'src/app/shared/libs/ui/button/src';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HlmButton],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
