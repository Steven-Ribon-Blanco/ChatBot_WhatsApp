const nodemailer = require('nodemailer')
const { pacientDatas, UpdateStep } = require('./mysql.js')

// Funcion envio de datos al correo......
// enviarMail = async (from) => {

//     console.log('data email:', from)                                    // name, cel, typeDocUser, idUser, valoracion)

//     const config = {
//         host: 'smtp.gmail.com',                                         // smtp.gmail.com
//         port: 587,
//         auth: {
//             user: 'stexrbnblack@gmail.com',                             // datos del correo que envia email
//             pass: 'skkzurloftejwjvs'                                    // password otorgado de gmail - opcion seguridad - acesso a gogle - constaseña aplicaciones y crea la contraseña
//         }
//     }

//     pacientDatas(from, async function (datas) {
//         console.log('[Array data-->]', datas)
//         const patientData = datas

//         console.log('[patientData-->]', patientData)

//         console.log('Array from-->', from)

//         const mensaje = {
//             from: 'stexrbnblack@gmail.com',                             // desde - correo del que envia
//             to: 'ribonblanco18@gmail.com, stexrbnblack@gmail.com',      // para - correo destino   aluradaza@hotmail.com, ribonblanco18@gmail.com, 
//             subject: 'Pide tu cita en CRMN',                            // Titulo del correo
//             text:                                                       // Cuerpo del correo
//                 `Pide tu cita en CRMN.

//         Datos del Paciente del CENTRO DE RESONANCIA MAGNETICA DEL NORTE.  

//             Paciente: ${patientData.name}
//             Tipo de id: ${patientData.typeDocument}
//             Numero id: ${patientData.idDocument}
//             Tipo de Examen: ${patientData.typeExam}
//             Telefono Contacto: ${patientData.cellPatient}
//             Correo del pasiente: ${patientData.email}
//              `               
//             //archivo adjunto
//             , attachments: [
//                 {   // utf-8 string as an attachment
//                     filename: 'Documento Identidad',
//                     content: `${patientData.jpgDocument}`,
//                     encoding: 'base64',
//                     contentType: 'image/jpeg'
//                 },
//                 {   // encoded string as an attachment
//                     filename: 'Orden Medica',
//                     content: `${patientData.jpgExam}`,
//                     encoding: 'base64',
//                     contentType: 'image/jpeg'
//                 },
//                 {   // encoded string as an attachment
//                     filename: 'Autorizacion',
//                     content: `${patientData.JpgAut}`,
//                     encoding: 'base64',
//                     contentType: 'image/jpeg'
//                 },
//                 {   // encoded string as an attachment
//                     filename: 'Historial Clinico',
//                     content: `${patientData.jpgHiCli}`,
//                     encoding: 'base64',
//                     contentType: 'image/jpeg'
//                 }
//             ]
//         }

//         const trasport = nodemailer.createTransport(config)
//         const info = await trasport.sendMail(mensaje)

//         console.log(info)
//         return info
//     })
// }

// Validando sincronismo de peticion para subirlo al server (prueba solucion de problema de sincronizacion de peticiones)
//------------------------------------------------------------------------------------------------------------------------------
enviarMail = async (from) => {

    console.log('data email:', from)                                    // name, cel, typeDocUser, idUser, valoracion)

    const config = {
        host: 'smtp.gmail.com',                                         // smtp.gmail.com
        port: 587,
        auth: {
            user: 'stexrbnblack@gmail.com',                             // datos del correo que envia email
            pass: 'skkzurloftejwjvs'                                    // password otorgado de gmail - opcion seguridad - acesso a gogle - constaseña aplicaciones y crea la contraseña
        }
    }

    const getPacientData = () => {
        return new Promise((resolve, reject) => {
            pacientDatas(from, (datas) => {
                resolve(datas);
            });
        });
    };

    try {
        const patientData = await getPacientData();

        console.log('[patientData-->]', patientData)

        console.log('Array from-->', from)

        const mensaje = {
            
            from: 'stexrbnblack@gmail.com',                             // desde - correo del que envia
            to: 'ribonblanco18@gmail.com, stexrbnblack@gmail.com',      // para - correo destino   aluradaza@hotmail.com, ribonblanco18@gmail.com, 
            subject: 'Pide tu cita en CRMN',                            // Titulo del correo
            text:                                                       // Cuerpo del correo
                `Pide tu cita en CRMN.

        Datos del Paciente del CENTRO DE RESONANCIA MAGNETICA DEL NORTE.  

            Paciente: ${patientData.name}
            Tipo de id: ${patientData.typeDocument}
            Numero id: ${patientData.idDocument}
            Tipo de Examen: ${patientData.typeExam}
            Telefono Contacto: ${patientData.cellPatient}
            Correo del pasiente: ${patientData.email}
             `               
            //archivo adjunto
            , attachments: [
                {   // utf-8 string as an attachment
                    filename: 'Documento Identidad',
                    content: `${patientData.jpgDocument}`,
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                },
                {   // encoded string as an attachment
                    filename: 'Orden Medica',
                    content: `${patientData.jpgExam}`,
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                },
                {   // encoded string as an attachment
                    filename: 'Autorizacion',
                    content: `${patientData.JpgAut}`,
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                },
                {   // encoded string as an attachment
                    filename: 'Historial Clinico',
                    content: `${patientData.jpgHiCli}`,
                    encoding: 'base64',
                    contentType: 'image/jpeg'
                }
            ]
        };

        const transport = nodemailer.createTransport(config);
        const info = await transport.sendMail(mensaje);

        console.log(info);
        return info;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
//-----------------------------------------------------------------------------------------------------------------------------


// enviarMail('573014241186@c.us')

module.exports = { enviarMail }