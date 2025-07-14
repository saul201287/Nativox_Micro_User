import admin from "../../Config/FireBase/faribase";
import { Email } from "../ValueObjects/Email";
import { TokenDeAutenticacion } from "../ValueObjects/TokenDeAutenticacion";

export interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
}

export interface FirebaseAuthResult {
  user: FirebaseUserData;
  token: string;
  expiresAt: Date;
}

export class FirebaseAuthService {
  async registrarUsuario(
    email: string,
    password: string,
    displayName?: string,
    phoneNumber?: string
  ): Promise<FirebaseAuthResult> {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false,
      });

      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email!,
          displayName: userRecord.displayName || undefined,
          phoneNumber: userRecord.phoneNumber || undefined,
          emailVerified: userRecord.emailVerified,
        },
        token: customToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new Error('El email ya está registrado en Firebase');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es demasiado débil');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('El email no es válido');
      }
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }

  async verificarToken(token: string): Promise<FirebaseUserData> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        displayName: decodedToken.name || undefined,
        phoneNumber: decodedToken.phone_number || undefined,
        emailVerified: decodedToken.email_verified || false,
      };
    } catch (error: any) {
      if (error.code === 'auth/id-token-expired') {
        throw new Error('Token expirado');
      }
      if (error.code === 'auth/id-token-revoked') {
        throw new Error('Token revocado');
      }
      if (error.code === 'auth/invalid-id-token') {
        throw new Error('Token inválido');
      }
      throw new Error(`Error al verificar token: ${error.message}`);
    }
  }


  async obtenerUsuarioPorUid(uid: string): Promise<FirebaseUserData> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || undefined,
        phoneNumber: userRecord.phoneNumber || undefined,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza la información de un usuario en Firebase
   */
  async actualizarUsuario(
    uid: string,
    updates: {
      displayName?: string;
      phoneNumber?: string;
      emailVerified?: boolean;
    }
  ): Promise<FirebaseUserData> {
    try {
      const userRecord = await admin.auth().updateUser(uid, updates);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || undefined,
        phoneNumber: userRecord.phoneNumber || undefined,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error: any) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Elimina un usuario de Firebase Authentication
   */
  async eliminarUsuario(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
    } catch (error: any) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }


  async enviarEmailVerificacion(uid: string): Promise<void> {
    try {
      await admin.auth().generateEmailVerificationLink(uid);
    } catch (error: any) {
      throw new Error(`Error al enviar email de verificación: ${error.message}`);
    }
  }

  
  async enviarEmailRestablecimiento(email: string): Promise<void> {
    try {
      await admin.auth().generatePasswordResetLink(email);
    } catch (error: any) {
      throw new Error(`Error al enviar email de restablecimiento: ${error.message}`);
    }
  }
} 