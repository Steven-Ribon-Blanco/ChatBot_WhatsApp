
const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js')
const { enviarMail } = require('./sendEmail')
const { variable_step, pacientDatas, UpdateStep, cellUsedInChat, saveTypeDocument, saveIdDocument, saveName, saveEmail, saveCellPatient, saveTypeExam, saveJpgDoc, saveJpgAut, saveJpgHiCli, saveJpgExam } = require('./mysql')

bot = async () => {

    const client = new Client({
        authStrategy: new LocalAuth(),
        // proxyAuthentication: { username: 'username', password: 'password' },
        puppeteer: {
            // args: '--proxy-server=proxy-server-that-requires-authentication.example.com'],
            headless: false
        }
    })

    // client.initialize()

    // Prueba de validacion para solucion problema sincronizacion de peticiones 
    //------------------------------------------------------------------------------------------------------------
    client.initialize().catch(error => {
        console.error('Error initializing client:', error);
    })
    //------------------------------------------------------------------------------------------------------------


    client.on('loading_screen', (percent, message) => {
        console.log('LOADING SCREEN', percent, message)
    })

    // Genera un QR para correr sobre ese numero de Whatsapp
    client.on('qr', (qr) => {
        // NOTE: This event will not be fired if a session is specified.
        console.log('QR RECEIVED', qr)
    })

    // Validacion de actualizacion correcta
    client.on('authenticated', () => {
        console.log('AUTHENTICATED')
    })

    client.on('auth_failure', msg => {
        // Fired if session restore was unsuccessful
        console.error('AUTHENTICATION FAILURE', msg)
    })

    // Muestra que se cincronizo con el numero y esta listo para responder el BOT
    client.on('ready', () => {
        console.log('READY')
    })

    // valida la respcion de mensaje al numero escanieado por el QR
    client.on('message', async msgIn => {
        var resp = msgIn.from
        var msg = msgIn.body.toLowerCase()

        console.log('MOSTRANDO msg y resp:-->', msg, resp)

        cellUsedInChat(await resp)                        // Guarda en la BD el numero que es usado para contactar el chatBot.

        // Valida si la variable Step contiene informacion, si tiene la obtiene y valida en que paso (step) se encuentra el usuario, sino debuelve null
        variable_step(resp, async function (data) {
            // Prueba de validacion para solucion problema sincronizacion de peticiones ----------------------------------------------------------------------------------
            // variable_step(resp).then(data => {
            //------------------------------------------------------------------------------------------------------------------------------------------------------------
            var step = data

            if (step !== null) {
                console.log('TAMAÑO DE STEP', (step.length))
                console.log('STEP.variable_step:::', step.variable_step) // muestra el valor de step
            } if (msg.includes("hola") || msg.includes("buenas") || msg.includes("noche") || msg.includes("dias") || msg.includes("informacion")) {

                client.sendMessage(resp, '¡Hola! Te damos la bienvenida al *Centro de Resonancia Magnética del Norte.* Para avanzar ' +
                    'en este chat solo debes digitar el *número* de la opción que necesitas.')
                client.sendMessage(resp, 'Al utilizar este medio, aceptas los términos y condiciones de WhatsApp. Si quieres ' +
                    'ampliar la información, ingresa aquí: https://www.whatsapp.com/legal')
                client.sendMessage(resp, '*1. Si Acepto*')
                client.sendMessage(resp, '*2. No Acepto*')

                UpdateStep(resp, resp, 'AcpCond')           // Actualiza la variable_step para seguir el siquiete paso - 25  17

            } else if ((msg === "1" || msg === "si" || msg === "acepto") && (step.length === 25)) {
                client.sendMessage(resp, 'Gracias por aceptar esta comunicación.')
                client.sendMessage(resp, 'Para avanzar en este chat solo debes digitar el *número* de la opción que necesitas ' +
                    ' \nElige la opción que necesitas:')
                client.sendMessage(resp, '*1. Agendar Cita*')
                client.sendMessage(resp, '*2. Descarga de resultados*')

                UpdateStep(resp, step, 'AgeCit')            // Actualiza la variable_step para seguir el siquiete paso - 32

            } else if ((msg.includes("2") || msg.includes("Descarga") || msg.includes("resultados")) && (step.length === 26)) {
                client.sendMessage(resp,
                    'Ingrese al siguiente link para descargar sus resultados: ' +
                    '*https://rmn.actualpacs.com/patientportal/')

            } else if ((msg === "1" || msg === "Agendar" || msg === "Cita") && (step.length === 32)) {
                client.sendMessage(resp,
                    'Para continuar con nuestra solicitud debes aceptar la política de administración de datos personales del ' +
                    '*CENTRO DE RESONANCIA MAGNETICA DEL NORTE*. Que puede ser consultada en el siguiente link: https://rmn.com.co/politica-habeas-data/')
                client.sendMessage(resp, '*1. Si Acepto*')
                client.sendMessage(resp, '*2. No Acepto*')

                UpdateStep(resp, step, 'AcePol')            // Actualiza la variable_step para seguir el siquiete paso  - 39

            } else if ((msg === '1' || msg === "si" || msg === "acepto") && (step.length === 39)) {
                client.sendMessage(resp, 'Para el Agendamiento de Citas digita. ¿Cuál es el tipo de documento de identificación del usuario? \n')
                client.sendMessage(resp, '1. CC (Cédula de ciudadanía),\n *digite 1*')
                client.sendMessage(resp, '2. CE (Cédula de extranjería),\n *digite 2*')
                client.sendMessage(resp, '3. TI (Tarjeta de idUserentidUserad),\n *digite 3*')
                client.sendMessage(resp, '4. Otro, *digita 4*')

                UpdateStep(resp, step, 'TypDoc')            // Actualiza la variable_step para seguir el siquiete paso - 46

            } else if ((msg === '1' || msg === "cc" || msg === "ciudadanía") && (step.length === 46)) {
                client.sendMessage(resp, 'Digite su Cédula de ciudadanía')

                saveTypeDocument('CC', resp)            // Guarda en la DB el tipo de documento (Document Type) 'typeDocument'
                UpdateStep(resp, step, 'CC')            // Actualiza la variable_step para seguir el siquiete paso  - 49

            } else if (step.length === 49) {

                saveIdDocument(msg, resp)                // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 
                UpdateStep(resp, step, '#-1')            // Actualiza la variable_step para seguir el siquiete paso  - 53

                client.sendMessage(resp, 'Por favor *Tomar una Foto al Documento de Identidad* antes mencionado')

            } else if ((msg === '2' || msg === 'ce' || msg === 'extranjería') && (step.length === 46)) {
                client.sendMessage(resp, 'Digite su Cédula de extranjería')

                saveTypeDocument('CE', resp)             // Guarda en la DB el tipo de documento (Document Type) 'typeDocument'
                UpdateStep(resp, step, 'CEx')            // Actualiza la variable_step para seguir el siquiete paso - 50

            } else if (step.length === 50) {

                saveIdDocument(msg, resp)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 
                UpdateStep(resp, step, '#2')           // Actualiza la variable_step para seguir el siquiete paso - 53

                client.sendMessage(resp, 'Por favor *Tomar una Foto al Documento de Identidad* antes mencionado')

            } else if ((msg === '3' || msg === 'ti' || msg === 'idUserentidUserad') && (step.length === 46)) {
                client.sendMessage(resp, 'Digite su Tarjeta de Identidad')

                saveTypeDocument('TI', resp)              // Guarda en la DB el tipo de documento (Document Type) 'typeDocument'
                UpdateStep(resp, step, 'TId.')            // Actualiza la variable_step para seguir el siquiete paso - 51

            } else if (step.length === 51) {

                saveIdDocument(msg, resp)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 
                UpdateStep(resp, step, '#')            // Actualiza la variable_step para seguir el siquiete paso - 53

                client.sendMessage(resp, 'Por favor *Tomar una Foto al Documento de Identidad* antes mencionado')

            } else if ((msg === '4' || msg === 'otro') && (step.length === 46)) {
                client.sendMessage(resp, 'Expesifique tipo de documento a ingresar')

                UpdateStep(resp, step, 'X')            // Actualiza la variable_step para seguir el siquiete paso - 48

            } else if (step.length === 48) {

                saveTypeDocument(msg, resp)             // Guarda en la DB el tipo de documento (Document Type) 'typeDocument'
                UpdateStep(resp, step, 'Td')            // Actualiza la variable_step para seguir el siquiete paso - 51

                client.sendMessage(resp, 'Digite su documento')

            } else if (step.length === 51) {

                saveIdDocument(msg, resp)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument'           
                UpdateStep(resp, step, '#')            // Actualiza la variable_step para seguir el siquiete paso - 53

                client.sendMessage(resp, 'Por favor *Tomar una Foto al Documento de Identidad* antes mencionado')

            } else if (msgIn.hasMedia && (step.length === 53)) {

                try {
                    const media = await msgIn.downloadMedia();

                    saveJpgDoc(media, resp)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'
                    UpdateStep(resp, step, 'Img')            // Actualiza la variable_step para seguir el siquiete paso - 57

                    client.sendMessage(resp, 'Ingrese el *Nombre completo* del Paciente.')
                } catch
                (error) {
                    console.error('Error downloading media:', error);
                }

            } else if (step.length === 57) {

                saveName(msg, resp)                    // Guarda en la DB el nombre typing por el usuario (name) 'name'
                UpdateStep(resp, step, 'N')            // Actualiza la variable_step para seguir el siquiete paso - 59

                client.sendMessage(resp, 'Ingrese el *Correo electronico* del Paciente al cual desea resivir la validacion de la cita.')


            } else if (step.length === 59) {

                saveEmail(msg, resp)                   // Guarda en la DB el correo (email) 'email' 
                UpdateStep(resp, step, '@')            // Actualiza la variable_step para seguir el siquiete paso - 61

                client.sendMessage(resp, 'Ingrese el *Numero telefonico* del Paciente.')

            } else if (step.length === 61) {

                saveCellPatient(msg, resp)               // Guarda en la DB el Numero del cell del usuario (CellPatient) 'cellPatient' 
                UpdateStep(resp, step, 'cel')            // Actualiza la variable_step para seguir el siquiete paso - 65

                client.sendMessage(resp,
                    `Sr./Sra. {name}, tenemos para ti una forma más fácil de gestionar tu solicitud, \n ` +
                    'en el siguiente link: https://rmn.com.co/agendamiento/')

                client.sendMessage(resp, 'De lo contrario selecciona la opción que deseas realizar ver opciones: ')
                client.sendMessage(resp, '*1. Radiología simple*')
                client.sendMessage(resp, '*2. Ecografías*')
                client.sendMessage(resp, '*3. Densitometrías*')
                client.sendMessage(resp, '*4. Tomografías*')
                client.sendMessage(resp, '*5. Resonancias*')
                client.sendMessage(resp, '*6. Mamografías*')
                client.sendMessage(resp, '*7. Electrocardiogramas*')
                client.sendMessage(resp, '*8. Monitoreo ambulatorio de presión arterial*')
                client.sendMessage(resp, '*9. Holter dinámico en 24 horas*')
                client.sendMessage(resp, '*10. Estudios bajo sedación*')
                client.sendMessage(resp, '*11. Biopsias*')
                client.sendMessage(resp, '*12. Pruebas de esfuerzos*')
                client.sendMessage(resp, '*13. Ecocardiogramas*')
                client.sendMessage(resp, '*14. Consulta por Cardiología* ')

            } else if (step.length === 65) {

                UpdateStep(resp, step, 'Exm')            // Actualiza la variable_step para seguir el siquiete paso - 69

                examValoracion(msg)                     // varia ble que toma el nombre del tipo de examen con el switch

                function examValoracion() {
                    switch (msg) {
                        case '1': return msg = 'Radiología simple'
                        case '2': return msg = 'Ecografías'
                        case '3': return msg = 'Densitometrías'
                        case '4': return msg = 'Tomografías'
                        case '5': return msg = 'Resonancias'
                        case '6': return msg = 'Mamografías'
                        case '7': return msg = 'Electrocardiogramas'
                        case '8': return msg = 'Monitoreo ambulatorio de presión arterial'
                        case '9': return msg = 'Holter dinámico en 24 horas'
                        case '10': return msg = 'Estudios bajo sedación'
                        case '11': return msg = 'Biopsias'
                        case '12': return msg = 'Pruebas de esfuerzos'
                        case '13': return msg = 'Ecocardiogramas'
                        case '14': return msg = 'Consulta por Cardiología'
                        default: break
                    }
                }
                saveTypeExam(msg, resp)                 // Guarda en la DB el tipo de Examen (Exam Typr) 'typeExam' 

                client.sendMessage(resp, 'Por favor *Tomar una Foto a la Orden medica* antes mencionado') // *Orden medica*: palabra en Negrilla

            } else if (msgIn.hasMedia && step.length === 69) {
                try {
                    const media = await msgIn.downloadMedia();

                    saveJpgExam(media, resp)                 // Guarda en la DB la imagen del tipo de Examen (Photo Exam Typr) 'jpgExam' 
                    UpdateStep(resp, step, 'Img')            // Actualiza la variable_step para seguir el siquiete paso - 73

                    client.sendMessage(resp, 'Por favor *Tomar una Foto a la Autorización* antes mencionado') // _Autorización_: palabra en Cursiba
                } catch (error) {
                    console.error('Error downloading media:', error);
                }

            } else if (msgIn.hasMedia && step.length === 73) {
                try {
                    const media = await msgIn.downloadMedia();

                    saveJpgAut(media, resp)                  // Guarda en la DB la imagen de la Autorizacion (Photo Autory) 'jpgAut'     
                    UpdateStep(resp, step, 'Aut')            // Actualiza la variable_step para seguir el siquiete paso - 77

                    client.sendMessage(resp, 'Por favor *Tomar una Foto a la Historia Clínica* antes mencionado') // ```Historia``` = monopalabra : H i s t o r i a
                } catch (error) {
                    console.error('Error downloading media:', error);
                }

            } else if (msgIn.hasMedia && step.length === 77) {
                try {
                    const media = await msgIn.downloadMedia();

                    saveJpgHiCli(media, resp)               // Guarda en la DB la imagen del Historia Clínica (Clinic Histpry)) 'jpgHiCli'
                    UpdateStep(resp, step, 'HC')            // Actualiza la variable_step para seguir el siquiete paso

                    // funcion que obtiene toda la informacion del paciente y toma el nombre y el correo para enviar un mensaje al usuario.
                    pac
                    ientDatas(resp, function (datas) {
                        console.log('[Array data-->]', datas)
                        const patientData = datas

                        // Mensaje al usuario con sus datos como Nombre y Correo
                        client.sendMessage(resp, `Sr./Sra. *${patientData.name}*, ah creado su cita exitosamente: validaremos su infomacion y en breve se le notificara al correo asignado ${patientData.email}.`)
                        client.sendMessage(resp, `Validaremos su información y en 24 horas se le notificará al correo asignado`)
                    })

                    enviarMail(resp)                        // Usa el numero del usuario en el chat para obtener sus datos y enviar un correo con sus datos para agendar la cita medica

                    client.sendMessage(resp,
                        '*Nota:* debe presentarse *30 minutos* antes de la hora de su cita para realizar el proceso de admisión. \n' +
                        'En caso de no poder cumplir, por favor cancelar la cita con un mínimo de 2 horas de anticipación a los siguientes \n' +
                        'números: 3176398945 – 3013712503. Comprenderá que ese espacio es vital para mí, porque puedo ayudar a otro usuario que lo necesite.')
                } catch (error) {
                    console.error('Error downloading media:', error);
                }
            }
            // ----- Prueba de validacion para solucion problema sincronizacion de peticiones -------------------------------------------------------------------------------
            //.catch(error => {        console.error('Error retrieving variable step:', error);
        }).catch(error => {
            console.error('Error retrieving variable step:', error);
        });
        // ---------------------------------------------------------------------------------------------------------------------------------------------------------------
    })
}

module.exports = { bot }