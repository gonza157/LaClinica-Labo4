import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
