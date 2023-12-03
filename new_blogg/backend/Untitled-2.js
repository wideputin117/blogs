// MAM
// 121

let string= "121";
function palidrome(string){
    let newString = string.split('');
    let no = string.length;
    console.log(newString);
    for(let  i = 0 ; i<=string.length/2; i++){
          if(newString[i] == newString[no - 1]){
          console.log("it is a palindrome");    }
          else{
            console.log("it is not a palindrome");
          }  
        }
    }

palidrome(string);