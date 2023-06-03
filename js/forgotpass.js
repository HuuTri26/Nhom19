//tạo mã xác thực khi quên mật khẩu
function generateRandomString(length = 6) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

let randomString = generateRandomString();
const authElement = document.querySelector(".auth");
authElement.innerText = "Mã xác thực: " + randomString;

function forgotPass(form) {
  const email = form.email.value;
  const authInp = form.auth.value;
  console.log(email);
  // Lấy dữ liệu từ danh sách người dùng ở localstorage
  const listUser = getListUser();
  console.log(listUser);
  for (const u of listUser) {
    if (email === u.email && authInp === randomString) {
      //Nếu tài khoản có property off bằng true thì thông báo bị khóa
      if (u.off) {
        alert("Tài khoản này đang bị khoá. Không thể đăng nhập.");
        return true;
      }
      alert("Xác thực email thành công!");
      window.location.replace("changePass.html");
      window.localStorage.setItem("CurrentEmail", JSON.stringify(email));
      return false;
    }
  }
  // Trả về thông báo nếu không khớp
  alert("Nhập sai email hoặc mã xác thực");
  location.reload();
  form.email.focus();
  return false;
}

function passChange(form) {
  const email = JSON.parse(window.localStorage.getItem("CurrentEmail")); // Lấy dữ liệu từ localstorage
  const pass = form.pass.value;
  console.log(email);
  console.log(pass);
  // Lấy dữ liệu từ danh sách người dùng ở localstorage
  const listUser = getListUser();
  for (let u of listUser) {
    if (u.email === email) {
      u.pass = pass;
      // Đăng nhập vào tài khoản mới tạo
      window.localStorage.setItem("CurrentUser", JSON.stringify(u));
    }
  }
  // Lưu người mới vào localstorage
  window.localStorage.setItem("ListUser", JSON.stringify(listUser));

  // Trả về thông báo nếu không khớp
  alert("Cập nhật mật khẩu thành công");
  window.location.replace("index.html");
  return false;
}
