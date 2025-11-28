import { trigger, transition, style, query, group, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  // Animación de derecha a izquierda (slide-right-to-left) - REQUERIDA
  transition('* => slide-right', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ left: '100%' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms ease-out', style({ left: '-100%' }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms ease-out', style({ left: '0%' }))
      ], { optional: true })
    ])
  ]),

  // Animación simple fade
  transition('* => fade', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);