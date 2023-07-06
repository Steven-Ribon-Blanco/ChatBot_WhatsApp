const mysql = require('mysql')
const util = require('util')

require("dotenv").config()

const connection = mysql.createConnection({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    database: process.env.MYSQL_DB_NAME,
    password: process.env.MYSQL_DB_PASSWORD,
    port: process.env.MYSQL_DB_PORT
})

// Confirma la Coneccion con la DB 'Base de Datos'
// connection.connect((err) => {
//     try {
//         if (err) throw err
//         console.log("conectado a la base de datos")
//     } catch (err) { console.error('Error downloading media:', err) }
// })

const query = util.promisify(connection.query).bind(connection)

// Busca el Id del usuario por su numero usado en el chatBot y debuelve el ultimo dato almacenado en la lista
// function serchId(from, callback) {
//     console.log('serchId---> ', from)
//     let insetQuery = 'SELECT `id` FROM `users`  WHERE `cellUsedInChat` = ?'
//     let queryData = mysql.format(insetQuery, from)
//     connection.query(queryData, function (err, result) {
//         try {
//             if (err) throw err
//             console.log('from de serchId-->', result)
//             last = result.length
//             result = result[last - 1].id
//             console.log('result = serchId-->', result)

//             callback(result)
//         } catch (e) {
//             console.log(e)
//         }
//     })
// }

//------------------------------------------------------------------------------------------------------------------------------------------
// Función para buscar el ID del usuario por su número usado en el chatBot y devolver el último dato almacenado en la lista
function searchId(from) {
    console.log('searchId---> ', from);
    const insetQuery = 'SELECT `id` FROM `users` WHERE `cellUsedInChat` = ?';
    const queryData = mysql.format(insetQuery, from);
    return query(queryData)
        .then((result) => {
            console.log('from de searchId-->', result);
            const last = result.length;
            const id = result[last - 1].id;
            console.log('result = searchId-->', id);
            return id;
        })
        .catch((error) => {
            console.log(error);
            throw error;
        });
}
// Función para obtener todos los datos del usuario y enviarlos por correo electrónico o mensaje
async function getPacientData(from) {
    try {
        const id = await searchId(from);
        console.log('datos del paciente---> ', from);
        const insetQuery = 'SELECT * FROM `users` WHERE `id` = ?';
        const queryData = mysql.format(insetQuery, id);
        const result = await query(queryData);
        console.log('id---> ', id);
        console.log('result---> ', result);

        const data = {
            name: result[0].name,
            typeDoc: result[0].typeDocument,
            id: result[0].idDocument,
            email: result[0].email,
            cell: result[0].cellPatient,
            exam: result[0].typeExam
        };

        console.log('data -->', data);
        return result[0];
    } catch (error) {
        console.log(error);
        throw error;
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------


// Obtiene todos los datos del usuario para enviar al correo de citas medicas o mensaje al usuario 
function pacientDatas(from, callback) {
    // busca el id del usuario verificando si esta almacenado o no 
    serchId(from, function (id) {
        console.log('datos del paciente---> ', from)
        let insetQuery = 'SELECT * FROM `users`  WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, id)
        connection.query(queryData, function (err, result) {
            try {
                if (err) throw err
                console.log('id---> ', id)
                console.log('result---> ', result)

                result = result[0]

                var data = { name: result.name, typeDoc: result.typeDocument, id: result.idDocument, email: result.email, cell: result.cellPatient, exam: result.typeExam }
                var data1 = [[result.name], [result.typeDocument], [result.idDocument], [result.email], [result.cellPatient], [result.typeExam]]
                console.log('data -->', data)
                console.log('data-1 -->', data1)

                // Retorna los datos 
                callback(result)
                // return result
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// 
function cellUsedInChat(data) {
    console.log('VALIDAR NUEMRO USUARIO:', data)
    let insetQueryValidat = `SELECT CASE cellUsedInChat WHEN ? THEN 1 ELSE 0 END AS Existe FROM users WHERE cellUsedInChat= '${data}'`
    let queryDataValidat = mysql.format(insetQueryValidat, data)
    console.log('queryDataValidat: ', queryDataValidat)

    connection.query(queryDataValidat, (err, result) => {
        try {
            if (err) throw err
            existe = result
            console.log('RESULT validat---->', result)
            console.log('RESULT[0] validat---->', (result.Existe === 1))
            console.log('existe:-->', existe)
            console.log('existe.length:-->', existe.length)
            if (result.length !== 1) {
                console.log('GUARDANDO EL NUEMERO DE USUARIO---->', data)
                let insetQuery = 'INSERT INTO `users` (`cellUsedInChat`) VALUES(?)';
                let queryData = mysql.format(insetQuery, data)
                connection.query(queryData, function (err, result) {
                    try {
                        if (err) throw err
                        console.log('RESULT---->', result)
                    } catch (e) {
                        console.log(e)
                    }
                })

                // UpdateStep(data, data, 'AcpCond')           // Actualiza la variable_step para seguir el siquiete paso - 25

            } // else { return }
        } catch (e) {
            console.log(e)
        }
    })
}


function validarNuemro(from) {

    console.log('VALIDAR NUEMRO USUARIO:', data)

    // Valida si existe una variable en la DB si existe 1 sino 0
    let insetQueryValidat = `SELECT CASE variable_step WHEN ? THEN 1 ELSE 0 END AS Existe FROM users WHERE variable_step= '${from}'`
    console.log('insetQueryValidat: ', insetQueryValidat)
    let queryDataValidat = mysql.format(insetQueryValidat, from)
    console.log('queryDataValidat: ', queryDataValidat)

    connection.query(queryDataValidat, (err, result) => {
        try {
            if (err) throw err
            existe = result
            console.log('RESULT validat---->', result)
            console.log('RESULT[0] validat---->', (result.Existe === 1))
            console.log('existe:-->', existe)
            console.log('existe.length:-->', existe.length)
            if (existe.length !== 0) {
                console.log('entrando a if existe.length !== 0')
                step = variableStep(step)
                console.log('step:-->', step)
            } // else { return existe }
        } catch (e) {
            console.log(e)
        }
    })
}

// Guarda el tipo de documento en la DB Base de datos
function saveTypeDocument(typeDoc, from) {
    console.log('sql data---->', typeDoc, from)
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `typeDocument` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [typeDoc, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda el numero del documento de identidad en la DB Base de datos
function saveIdDocument(idDoc, from) {
    console.log('sql data---->', idDoc, from)
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `idDocument` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [idDoc, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda el nombre en la DB Base de datos
function saveName(name, from) {
    console.log('sql data---->', name, from)
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `name` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [name, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda el email en la DB Base de datos
function saveEmail(email, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `email` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [email, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda el numero de cell en la DB Base de datos
function saveCellPatient(cell, from) {
    console.log('cell---->', cell)
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `cellPatient` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [cell, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda el tipo de exam a realizarce en la DB Base de datos
function saveTypeExam(exam, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `typeExam` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [exam, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda una imagen o foto del documento de identidad en la DB Base de datos
function saveJpgDoc(jpgDoc, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `jpgDocument` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [jpgDoc.data, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda una imagen o foto del examen medico en la DB Base de datos
function saveJpgExam(jpgExam, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `jpgExam` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [jpgExam.data, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda una imagen o foto de la Autorizacion en la DB Base de datos
function saveJpgAut(jpgExam, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `jpgAut` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [jpgExam.data, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda una imagen o foto el historial clinico en la DB Base de datos
function saveJpgHiCli(jpgExam, from) {
    serchId(from, function (id) {
        let insetQuery = 'UPDATE `users` SET `jpgHiCli` = ? WHERE `id` = ?'
        let queryData = mysql.format(insetQuery, [jpgExam.data, id])

        connection.query(queryData, (err, result) => {
            try {
                if (err) throw err
                console.log('RESULT---->', result)
            } catch (e) {
                console.log(e)
            }
        })
    })
}

// Guarda y valida en que paso o STEP se encuentra el usuario
function variable_step(from, callback) {
    console.log('ENTRANDO AH variable_step')
    serchId(from, function (id) {
        console.log('sql id: ', id)
        let insetQueryVariable_step = 'SELECT `variable_step` FROM `users`  WHERE `id` = ?'
        let queryDataVariable_step = mysql.format(insetQueryVariable_step, id)
        connection.query(queryDataVariable_step, function (err, result) {
            try {
                if (err) throw err
                console.log('result-->', result)

                result = result[0]
                console.log('result.length-->', result.length)
                console.log('result', result)
                console.log('result.variable_step-->', result.variable_step)
                console.log('result[0]-->', result)

                if (result.length !== null) {
                    console.log('entrando a if existe.length !== null')
                    // step = validarStep(step)

                    console.log('return result :-->', result)
                    callback(result.variable_step)
                } else { callback([]) } // return []}

            } catch (e) {
                console.log(e)
            }
        })

    })
}

// Prueba de optener los pasos del usuario
function validarStep(step) {
    console.log('ENTRANDO AH variablestep.....')
    serchId(from, function (id) {
        console.log('sql id: ', id)

        let insetQueryVariable_step = 'SELECT `variable_step` FROM `users`  WHERE `id` = ?'
        let queryDataVariable_step = mysql.format(insetQueryVariable_step, id)
        connection.query(queryDataVariable_step, function (err, result) {
            try {
                if (err) throw err
                console.log('result-->', result)

                step = result

                // result = '' ? variable_step = []null : variable_step = result
                console.log('variable_step-->', step)

                // return step

            } catch (e) {
                console.log(e)
            }
        })

    })
}

// Guarda y actualiza el sigueinte paso o STEP del usuario
function UpdateStep(from, lastStep, nextStep) {
    let last = lastStep.split('+').length
    console.log('LASTSTEP:', lastStep)
    console.log('ULTIMA WORD CADENA:', [last - 1]);   // optiene la ultima palabra de la cadena
    console.log('COMPARACION LASTSTEP Y NEXTSTEP:', lastStep, ',', nextStep, ',', lastStep.split('+')[last - 1]);

    if (lastStep.split('+')[last - 1] !== nextStep) {
        serchId(from, function (id) {
            let insetQuery = 'UPDATE `users` SET `variable_step` = ? WHERE `id` = ?'
            let queryData = mysql.format(insetQuery, [lastStep + '+' + nextStep, id])
            connection.query(queryData, (err, result) => {
                try {
                    if (err) throw err
                    // callback(result)
                    console.log('result---> ', result)

                } catch (e) {
                    console.log('error: ', e)
                }
            })
            // return variable_step = []
        })
    } // else return variable_step = []
}

// cellUsedInChat('573014241186@c.us')
// variable_step('573014241186@c.us')

// pacientDatas('573014241186@c.us')
// console.log('const id : : :', serchId('573014241186@c.us'))

module.exports = { cellUsedInChat, saveTypeDocument, saveIdDocument, saveName, saveEmail, saveCellPatient, saveTypeExam, saveJpgDoc, saveJpgExam, saveJpgAut, saveJpgHiCli, pacientDatas, getPacientData, variable_step, UpdateStep }

