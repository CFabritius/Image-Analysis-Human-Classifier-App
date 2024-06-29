let IMAGES = [];
class ClassifyImage {
    constructor(file, label) {
        const reader = new FileReader();
        reader.onload = e => this.image = e.target.result;
        reader.readAsDataURL(file);

        this.image = null;          //will hold the image data once loaded
        this.label = label;         //either "dandelion" or "other"
        this.classification = null; //boolean either 'true' for dandelion or 'false' for other
    }
}

let current_image = 0;

function $(selector) {
    return document.querySelector(selector);
}

$("#dandelion_files_uploader").addEventListener("change", event => {
    Array.from(event.target.files).forEach(file => {
        IMAGES.push(new ClassifyImage(file, "dandelion"));
    });
});

$("#other_files_uploader").addEventListener("change", event => {
    Array.from(event.target.files).forEach(file => {
        IMAGES.push(new ClassifyImage(file, "other"));
    });
});

function shuffle(array) {
    //Credit to this one stackoverflow post that I have consulted *many* times over the years:
    //https://stackoverflow.com/questions/6274339/
    for(let i = array.length-1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array;
}

function display_image() {
    $("#image_preview").innerHTML = `<img src=${IMAGES[current_image].image}>`;
}

function update_progress_display() {
    $("#progress_label").innerHTML = current_image + 1 + "/" + IMAGES.length;
    $("#progress_bar")["value"] = current_image + 1;
}

function start_classifying() {
    shuffle(IMAGES);
    //do this after shuffling the images, so that the ratio between dandelion and other images stays relatively the same
    let classification_amount = Number($("#amount_input").value);
    classification_amount = Math.max(0, Math.min(classification_amount, IMAGES.length));

    if(!classification_amount) return;

    IMAGES = IMAGES.slice(0, classification_amount);

    $("#progress_bar")["max"] = IMAGES.length;
    update_progress_display();
    display_image();
    $("#upload_mode").hidden = true;
    $("#classification_mode").hidden = false;
}

function mark_dandelion() {
    IMAGES[current_image].classification = true;
    
    if(current_image < IMAGES.length-1) {
        current_image++;
        update_progress_display();
        display_image();
    }
}

function mark_other() {
    IMAGES[current_image].classification = false;
    
    if(current_image < IMAGES.length-1) {
        current_image++;
        update_progress_display();
        display_image();
    }
}

function go_back() {
    if(current_image > 0) {
        current_image--;
        update_progress_display();
        display_image();
    }
}

function find_missing_values() {
    let missing_values = [];
    for(let i = 0; i < IMAGES.length; i++) {
        if(IMAGES[i].classification == null) {
            missing_values.push(i+1);
        }
    }

    if(missing_values.length > 0) {
        alert("You did not classify the following images: " + missing_values.join(","));
        return true;
    } else {
        return false;
    }
}

function evaluate_human_classification() {
    if(find_missing_values()) return;

    let results = {
        "dandelion correct": 0,
        "dandelion wrong":   0,
        "other correct":     0,
        "other wrong":       0
    }
    for(const image of IMAGES) {
        if(image.label == "dandelion") {
            if(image.classification == true) {
                results["dandelion correct"]++;
            } else {
                results["dandelion wrong"]++;
            }
        } else {
            if(image.classification == false) {
                results["other correct"]++;
            } else {
                results["other wrong"]++;
            }
        }
    }
    
    $("#classification_mode").hidden = true;
    $("#evaluation_mode").hidden = false;
    $("#evaluation_mode").innerHTML = `
        <table>
            <tr>
                <td>Correctly classified dandelions</td>
                <td>${results["dandelion correct"]}</td>
            </tr>
            <tr>
                <td>Correctly classified as other</td>
                <td>${results["other correct"]}</td>
            </tr>
            <tr>
                <td>Dandelions classified as other</td>
                <td>${results["dandelion wrong"]}</td>
            </tr>
            <tr>
                <td>Other classified as dandelion</td>
                <td>${results["other wrong"]}</td>
            </tr>
        </table>
    `;
}
