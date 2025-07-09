export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredOn: Date;
  eventVersion: number;
}

export class UsuarioRegistradoEvent implements DomainEvent {
  eventId: string;
  eventType: string = "UsuarioRegistrado";
  aggregateId: string;
  occurredOn: Date;
  eventVersion: number = 1;

  constructor(
    public readonly usuarioId: string,
    public readonly email: string,
    public readonly nombre: string,
    public readonly fcmToken: string
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = usuarioId;
    this.occurredOn = new Date();
  }
}

export class ProgresoActualizadoEvent implements DomainEvent {
  eventId: string;
  eventType: string = "ProgresoActualizado";
  aggregateId: string;
  occurredOn: Date;
  eventVersion: number = 1;

  constructor(
    public readonly usuarioId: string,
    public readonly leccionId: string,
    public readonly porcentajeAvance: number
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = usuarioId;
    this.occurredOn = new Date();
  }
}

export class UpdateFcmTokenEvent implements DomainEvent {
  eventId: string;
  eventType: string = "FcmTokenActualizado";
  aggregateId: string;
  occurredOn: Date;
  eventVersion: number = 1;

  constructor(
    public readonly usuarioId: string,
    public readonly fcmToken: string
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = usuarioId;
    this.occurredOn = new Date();
    this.fcmToken = fcmToken;
  }
}
