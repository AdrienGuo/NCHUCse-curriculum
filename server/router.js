import express from 'express';
import { spawn } from 'child_process';
import curriculum from './db/curriculum';
import DB from './db/curriculum';
import constData from './const';

const router = express.Router();

router.get('/getWebsite/:classroom', async (req, res) => {
    let curriculum = [], result;
    let start_month, start_date;
    let classroom = req.params.classroom;

    // try connect DB and select from DB
    try {
        result = await DB.select_website_curriculum_classroom(classroom);
    } catch (err) {
        res.sendStatus(500);
    }

    // try get start date of school and check is summer or winter
    try {
        const startOfSchool = await getStartOfSchool();
        let d = new Date();
        start_month = startOfSchool[constData.isSummerWinter[d.getMonth() + 1]]["month"];
        start_date = startOfSchool[constData.isSummerWinter[d.getMonth() + 1]]["date"];
    } catch (err) {
        console.log(err);
    }
    for (let i = 0; i < result.length; i++){
        let start_time = constData.startTimestamps[result[i]["time"][0]];
        let end_time = constData.endTimestamps[result[i]["time"].slice(-1)];
        curriculum.push({
            title: result[i]["name"] + "\n" + result[i]["grade"] + "\n" + result[i]["teacher"],
            startDate: '2020-' + start_month + '-' + start_date + 'T' + start_time + ":00",
            endDate: '2020-' + start_month + '-' + start_date + 'T' + end_time + ":00",
            rRule: 'RRULE:FREQ=WEEKLY;COUNT=18;WKST=MO;BYDAY=' + constData.weekIndex[result[i]["week"]],
            addtime: result[i]["timestamp"],
            name: result[i]["name"],
            otherFormat: result[i]["grade"] + " " + result[i]["teacher"],
            curriculumType: 1
        })
    }
    res.json(curriculum);
});

router.get('/getStatic/:classroom', async (req, res) => {
    let curriculum = [], result;
    let start_month, start_date;
    let classroom = req.params.classroom;
    
    // try connect DB and select from DB
    try {
        result = await DB.select_static_purpose_classroom(classroom);
    } catch (err) {
        res.sendStatus(500);
    }
    
    // try get start date of school and check is summer or winter
    try {
        const startOfSchool = await getStartOfSchool();
        let d = new Date();
        start_month = startOfSchool[constData.isSummerWinter[d.getMonth() + 1]]["month"];
        start_date = startOfSchool[constData.isSummerWinter[d.getMonth() + 1]]["date"];
    } catch (err) {
        console.log(err);
    }
    for (let i = 0; i < result.length; i++){
        curriculum.push({
            title: result[i]["name"] + "\n" + result[i]["office"],
            startDate: '2020-' + start_month + '-' + start_date + 'T' + result[i]["start_time"],
            endDate: '2020-' + start_month + '-' + start_date + 'T' + result[i]["end_time"],
            rRule: 'RRULE:FREQ=WEEKLY;COUNT=18;WKST=MO;BYDAY=' + constData.weekIndex[result[i]["week"]],
            addtime: result[i]["timestamp"],
            name: result[i]["name"],
            otherFormat: result[i]["office"],
            curriculumType: 2
        })
    }
    res.json(curriculum);
})

router.get('/getTemporary/:classroom', async (req, res) => {
    let curriculum = [], result;    
    let classroom = req.params.classroom;
    try {
        result = await DB.select_temporary_purpose_classroom(classroom);
    } catch (err) {
        res.sendStatus(500);
    }
    for (let i = 0; i < result.length; i++){
        curriculum.push({
            title: result[i]["name"] + "\n" + result[i]["office"],
            startDate: result[i]["date"] + 'T' + result[i]["start_time"],
            endDate: result[i]["date"] + 'T' + result[i]["end_time"],
            addtime: result[i]["timestamp"],
            name: result[i]["name"],
            otherFormat: result[i]["office"],
            curriculumType: 3
        })
    }
    res.json(curriculum);
})

// Get the start date of school from python
function getStartOfSchool() {
    const python = spawn('python3', ['./python/確認幾號開學/check_start_school_date.py']);
    let date;
    return new Promise((resolve, rejects) => {
        python.stdout.on('data', (data) => {
            if (data === {}){
                reject(data);
            } else {
                resolve(JSON.parse(data))
            }
        });
    })
}

export default router