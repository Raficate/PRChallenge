import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

}
