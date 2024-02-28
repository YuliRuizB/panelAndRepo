import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  template: `
    <audio controls>
      <source [src]="audioUrl" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  `,
  styles: []
})
export class AudioPlayerComponent {
  @Input() audioUrl: string = '';
}