var currentuser; // user hiện tại, biến toàn cục
window.onload = function () {
  khoiTao();

  // autocomplete cho khung tim kiem
  autocomplete(document.getElementById("search-box"), list_products);

  // thêm tags (từ khóa) vào khung tìm kiếm
  var tags = ["Samsung", "iPhone", "Xiaomi", "Oppo", "Realme"];
  for (var t of tags) addTags(t, "index.html?search=" + t);

  currentuser = getCurrentUser();
  addProductToTable(currentuser);
};

function addProductToTable(user) {
  var table = document.getElementsByClassName("listSanPham")[0];

  var s = `
		<tbody>
			<tr>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

  if (!user) {
    s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Bạn chưa đăng nhập !!
					</h1> 
				</td>
			</tr>
		`;
    table.innerHTML = s;
    return;
  } else if (user.products.length == 0) {
    s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Giỏ hàng trống !!
					</h1> 
				</td>
			</tr>
		`;
    table.innerHTML = s;
    return;
  }

  var totalPrice = 0;
  for (var i = 0; i < user.products.length; i++) {
    var masp = user.products[i].ma;
    var soluongSp = user.products[i].soluong;
    var p = timKiemTheoMa(list_products, masp);
    var price = p.promo.name == "giareonline" ? p.promo.value : p.price;
    var thoigian = new Date(user.products[i].date).toLocaleString();
    var thanhtien = stringToNum(price) * soluongSp;

    s +=
      `
			<tr>
				<td>` +
      (i + 1) +
      `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` +
      p.name.split(" ").join("-") +
      `" title="Xem chi tiết">
						` +
      p.name +
      `
						<img src="` +
      p.img +
      `">
					</a>
				</td>
				<td class="alignRight">` +
      price +
      ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` +
      masp +
      `')"><i class="fa fa-minus"></i></button>
					<input size="1" class="changeNum" onchange="capNhatSoLuongFromInput(this, '` +
      masp +
      `')" value=` +
      soluongSp +
      `>
					<button onclick="tangSoLuong('` +
      masp +
      `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` +
      numToString(thanhtien) +
      ` ₫</td>
				<td style="text-align: center" >` +
      thoigian +
      `</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` +
      i +
      `)"></i> </td>
			</tr>
		`;
    // Chú ý nháy cho đúng ở giamsoluong, tangsoluong
    totalPrice += thanhtien;
  }

  s +=
    `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN: </td>
				<td class="alignRight">` +
    numToString(totalPrice) +
    ` ₫</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>
	`;

  table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
  let list = getListProducts();
  if (window.confirm("Xác nhận hủy mua")) {
    let sl = currentuser.products[i].soluong;
    let currentProduct = timKiemTheoMa(list, currentuser.products[i].ma);
    currentProduct.qty += sl;
    currentuser.products.splice(i, 1);
    setListProducts(list);
    capNhatMoiThu();
  }
}

function thanhToan() {
  var c_user = getCurrentUser();
  if (c_user.off) {
    alert("Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!");
    addAlertBox(
      "Tài khoản của bạn đã bị khóa bởi Admin.",
      "#aa0000",
      "#fff",
      10000
    );
    return;
  }

  if (!currentuser.products.length) {
    addAlertBox(
      "Không có mặt hàng nào cần thanh toán !!",
      "#ffb400",
      "#fff",
      2000
    );
    return;
  }
  if (window.confirm("Thanh toán giỏ hàng?")) {
    if (!c_user.address || !c_user.phone) {
      if (
        window.confirm(
          "Vui lòng cập nhật thông tin địa chỉ và số điện thoại để giao hàng!"
        )
      )
        window.location.replace("nguoidung.html");
    } else {
      currentuser.donhang.push({
        sp: currentuser.products,
        ngaymua: new Date(),
        tinhTrang: "Đang chờ xử lý",
      });
      currentuser.products = [];
      capNhatMoiThu();
      addAlertBox(
        "Chúng tôi sẽ liên lạc với quý khách để trao đổi thông tin gửi hàng. Vui lòng kiểm tra điện thoại!",
        "#17c671",
        "#fff",
        4000
      );
    }
  }
}

function xoaHet() {
  let list = getListProducts();
  if (currentuser.products.length) {
    if (window.confirm("Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!")) {
      for (let i = 0; i < currentuser.products.length; i++) {
        let sl = currentuser.products[i].soluong;
        let currentProduct = timKiemTheoMa(list, currentuser.products[i].ma);
        currentProduct.qty += sl;
      }
      currentuser.products =[];
      setListProducts(list);
      capNhatMoiThu();
    }
  }
}

// Cập nhật số lượng lúc nhập số lượng vào input

function capNhatSoLuongFromInput(inp, masp) {
  //Lấy giá trị hiện tại của số lượng
  let val;
  for (let i = 0; i < currentuser.products.length; i++) {
    if (currentuser.products[i].ma == masp) {
      val = currentuser.products[i].soluong;
    }
  }
  console.log(val);

  let list = getListProducts();
  //Tìm sản phẩm để cập nhật số lượng
  let currentProduct = timKiemTheoMa(list, masp);

  var soLuongMoi = Number(inp.value);
  //kiểm tra số lượng mới có phù hợp không
  if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;
  //tính số lượng chênh lệch
  let modified = soLuongMoi - val;
  let productQty = currentProduct.qty - modified;
  //Nếu trừ đi mà số lượng còn trong kho là âm thì thông báo không đủ hàng
  if (productQty < 0) {
    alert(
      "Số lượng sản phẩm không đủ, chỉ còn " + currentProduct.qty + "sản phẩm!"
    );
    return;
  }
  //Nếu đủ hàng thì trừ số lượng trong kho một lượng thay đổi (modified) tương ứng
  else {
    currentProduct.qty -= modified;
  }

  for (var p of currentuser.products) {
    if (p.ma == masp) {
      p.soluong = soLuongMoi;
    }
  }
  //Lưu lại danh sách sản phẩm
  setListProducts(list);
  capNhatMoiThu();
}
//Ham tang so luong san pham
function tangSoLuong(masp) {
  let list = getListProducts();
  //Tìm sản phẩm để giảm số lượng
  let currentProduct = timKiemTheoMa(list, masp);
  //Nếu còn thì trừ bớt, còn bằng 0 thì không trừ nữa vì hiện trong admin là số âm
  if (currentProduct.qty > 0) currentProduct.qty--;

  for (var p of currentuser.products) {
    if (p.ma == masp) {
      p.soluong++;
    }
  }
  //Lưu lại vào listProducts
  setListProducts(list);
  //Nếu hết hàng thì thông báo và không thêm sản phẩm nữa
  if (currentProduct.qty == 0) {
    alert("Sản phẩm tạm thời hết hàng, vui lòng quay lại sau!");
    return;
  }

  capNhatMoiThu();
}

function giamSoLuong(masp) {
  let list = getListProducts();
  //Tìm sản phẩm để tăng số lượng trở lại
  let currentProduct = timKiemTheoMa(list, masp);
  //với mỗi lần giảm số lượng trong giỏ hàng, tăng trong kho thêm 1
  currentProduct.qty++;
  for (var p of currentuser.products) {
    if (p.ma == masp) {
      if (p.soluong > 1) {
        p.soluong--;
      } else {
        return;
      }
    }
  }
  //Lưu lại trong local
  setListProducts(list);
  console.log(currentProduct.qty);
  capNhatMoiThu();
}

function capNhatMoiThu() {
  // Mọi thứ
  animateCartNumber();

  // cập nhật danh sách sản phẩm trong localstorage
  setCurrentUser(currentuser);
  updateListUser(currentuser);

  // cập nhật danh sách sản phẩm ở table
  addProductToTable(currentuser);

  // Cập nhật trên header
  capNhat_ThongTin_CurrentUser();
}
