function loadImages(){
    return $.ajax({
        url: "js/photos.json",
        type: "GET",
        dataType: "json",
        success: function(data){
            
            displayImages(data);
        },
        error: function(){
            alert("json not found");
        }
    });
}
function displayImages(data){
   
    let imagesOrder = [];

    if(sessionStorage.getItem("imagesOrder"))
    {
        imagesOrder=sessionStorage.getItem("imagesOrder");
        imagesOrder= imagesOrder.split(',');
    }
    else
    {
        for(i = 0; i < data["photos"].length; i++)
            imagesOrder.push(i);
    }

    for(i = 0; i < imagesOrder.length; i++)
        displayOneImage(data.photos[imagesOrder[i]], imagesOrder[i], i);
    
    sessionStorage.setItem("imagesOrder", imagesOrder);
}

// displays image sent from displayImages()
function displayOneImage(image, imgNum){
    
    $("#images").append('<div class="drag" id="drag' + imgNum + '"><img src="' + image.src + '"class="image animate" id="img_' + imgNum + '"></div>');
    $("#img_"+imgNum+"").draggable({
        snap: "#img"+imgNum+"AreaPos",
        snapMode: "inner",
        revert: "invalid"
    });
}

// ends game if there are no images in #images
function gameOver(){
    $('.timer').countimer("stop");
    alert("Game over :)");
}

// moves image between #images and #playArea
// if reset=0, then it moves the image from #images to #playArea
// if reset=1, then it moves the image from #playArea to #images
// if there are no images in #images, calls gameOver()
function exchangeImg(imgNum, reset){

    if(reset)
    {
        $("#drag"+imgNum+"").append($("#img_"+imgNum+""));
        $("#img_"+imgNum+"").css("left", 0);
        $("#img_"+imgNum+"").css("top", 0);
    }
    else
    {
        $("#img"+imgNum+"AreaPos").append($("#img_"+imgNum+""));
        $("#img_"+imgNum+"").css("left", 0);
        $("#img_"+imgNum+"").css("top", 0);
        if($("#images").find($(".image")).length == 0)
            gameOver();
    }
}

// create position in #playArea for each puzzle piece in #images
function createPlayAreaPositions(){

    let imagesOrder = [8,1,0,6,7,2,4,5,3]; // order of images to create a whole picture
 
    for(i=0; i<$(".image").length; i++)
    {        
        $("#playArea").append('<div id="img' + imagesOrder[i] + 'AreaPos" class="imgArea"></div>');
        $("#img"+imagesOrder[i]+"AreaPos").css("width", $("#img_"+imagesOrder[i]+"").width());
        $("#img"+imagesOrder[i]+"AreaPos").css("height", $("#img_"+imagesOrder[i]+"").height());
    }
}

// create droppable area for correct image
function droppableAreas()
{
    for(i=0; i<$(".image").length; i++)
    {
        $("#img"+i+"AreaPos").droppable({

            accept: "#img_"+i+"",

            // image was dropped into his droppable area
            drop: function(event, ui){
                exchangeImg(ui.draggable[0].id[4], 0) // [4] is index in img_x, so it returns x -> the number of img, 0 = don't reset
            }
        });
    };
}

// animate putting puzzle pieces together and then unfold them
$("#demoButton").on("click touch", function(){
    
    // implementation of delay between steps inspired by top post by Justin Niessner
    // https://stackoverflow.com/questions/8896327/jquery-wait-delay-1-second-without-executing-code

    let i = $(".image").length-1;
    let iteration = $(".image").length*2;

    function animation(){
        if(iteration){
            let posArea = $("#img"+i+"AreaPos").offset();
            let posImg = $("#img_"+i+"").offset();
            let moveLeft = posArea.left-posImg.left;
            let moveTop = posArea.top-posImg.top;

            $("#img_"+i+"").animate({left: moveLeft, top: moveTop});

            i--;
            iteration--;

            // longer wait before unfolding
            if(iteration==9)
            {
                i=$(".image").length-1;
                setTimeout(animation, 2000);
            }
            
            // fold, unfold
            else
                setTimeout(animation, 500);
        }
    }
    animation();
})

// reset images from #playArea into their original position in #images
$("#resetButton").on("click touch", function(){

    $('.imgArea').children('img').each(function () {
        exchangeImg($(this).attr('id')[4], 1); // [4] is index in img_x, so it returns x -> the number of img, 1 = reset
    });
    $('.timer').countimer("destroy");
    startIfClicked();
})

function startIfClicked(){
    let clicked = 0;
    $('.timer').countimer({
        autoStart: false,
        useHours: false
    });
   
    $(".drag").on("click touchstart mousedown", function(){
        if(!clicked)
        {
            $('.timer').countimer("start");
            clicked = 1;
        }
    })
}

// wait until all images are loaded, then execute the rest
$.when(loadImages()).done(function(){
    createPlayAreaPositions();
    droppableAreas();
    startIfClicked();
})