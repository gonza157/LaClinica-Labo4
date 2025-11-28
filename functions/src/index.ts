import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import fetch from 'node-fetch';
import * as nodemailer from 'nodemailer';

setGlobalOptions({ maxInstances: 10 });

export const verifyRecaptcha = onRequest(async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const token = req.body.token;
    const secret = '6Le1WxcsAAAAAHdTc7pAtA89wn0-_QSEbA9HV5aI'; // Tu clave secreta

    console.log('Token recibido:', token); // Log del token

    if (!token) {
        res.status(400).send({ success: false, error: 'No token provided' });
        return;
    }

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
            method: 'POST'
        });
        const data = await response.json() as any;
        console.log('reCAPTCHA response:', data); // Log para depuración

        if (data.success) {
            res.status(200).send({ success: true });
        } else {
            res.status(400).send({ success: false, error: data['error-codes'], details: data });
        }
    } catch (err) {
        res.status(500).send({ success: false, error: 'Server error' });
    }
});

// Configurar el transportador de email usando Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'g.iglesiasalonzo@gmail.com',
        pass: 'cdef gyur gydi xfyv'
    }
});

export const enviarEmailAprobacion = onRequest(async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { email, nombre, apellido } = req.body;

    if (!email || !nombre || !apellido) {
        res.status(400).send({ success: false, error: 'Faltan datos requeridos' });
        return;
    }

    try {
        const mailOptions = {
            from: '"Clínica Iglesias" <g.iglesiasalonzo@gmail.com>',
            to: email,
            subject: 'Cuenta aprobada - Clínica Iglesias',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #8e24aa; text-align: center;">Clínica Iglesias</h2>
                    <p>Hola Dr/Dra. ${nombre} ${apellido},</p>
                    <p>Te escribimos para informarte que tu cuenta ha sido aprobada.</p>
                    <p>Ya puedes ingresar al sistema con tus credenciales:</p>
                    <ul style="margin: 15px 0;">
                        <li>Gestionar horarios</li>
                        <li>Recibir turnos de pacientes</li>
                        <li>Acceder al panel</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://clinica-online-da668.web.app/login" 
                           style="background: #8e24aa; 
                                  color: white; 
                                  padding: 12px 25px; 
                                  text-decoration: none; 
                                  border-radius: 5px; 
                                  display: inline-block;
                                  font-weight: bold;">
                            Ingresar al Sistema
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <p>Saludos,<br>
                        Administración - Clínica Iglesias</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email enviado exitosamente a:', email);
        res.status(200).send({ success: true });
        
    } catch (error) {
        console.error('Error enviando email:', error);
        res.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
});