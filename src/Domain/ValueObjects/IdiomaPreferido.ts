export enum IdiomaPreferido {
  TZELTAL = "tseltal",
  ZAPOTECO = "zapoteco",
  ESPANOL = "espanol",
}

export class IdiomaPreferidoVO {
  constructor(private readonly value: IdiomaPreferido) {
    if (!Object.values(IdiomaPreferido).includes(value)) {
      throw new Error('Idioma no soportado');
    }
  }

  getValue(): IdiomaPreferido {
    return this.value;
  }

  equals(other: IdiomaPreferidoVO): boolean {
    return this.value === other.value;
  }
}