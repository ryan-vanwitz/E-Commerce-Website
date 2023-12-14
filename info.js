var priceToMakeSale = 0;
var allProducts;
var currentSort = null; 
var currentCartID;


getProducts();
findCartID();
findClosedCarts();

function getProducts() {
    $.ajax({
        url: "final.php/getProduct?category=%&subcategory=%&id=0",
        method: "GET"
    }).done(function (data) {
        if (data && data.result) {
            allProducts = data.result; // Store all products
            applyFilters(); // Apply filters initially
        } else {
            console.error("Error fetching products. 'result' property is null or undefined.");
        }
    }).fail(function (xhr, status, error) {
        console.error("Error fetching products. Status:", status, "Error:", error);
    });
}

function applyFilters() {
    var selectedSubcategory = $("#subcategoryDropdown").val();
    
    // Check if selectedSubcategory is not undefined before calling toLowerCase
    var subcategoryMatch =
        selectedSubcategory && (selectedSubcategory === "all" || selectedSubcategory.toLowerCase().replace(/\s/g, '') === selectedSubcategory);

    var selectedPriceRange = $("#priceDropdown").val();
    // Apply filters to the products
    var filteredProducts = allProducts.filter(function (product) {
        var subcategoryMatch =
            selectedSubcategory === "all" || product.subcategory.toLowerCase().replace(/\s/g, '') === selectedSubcategory;
        var priceMatch =
            selectedPriceRange === "all" ||
            (selectedPriceRange === "0-5" && product.price >= 0 && product.price <= 5) ||
            (selectedPriceRange === "5-10" && product.price > 5 && product.price <= 10) ||
            (selectedPriceRange === "10+" && product.price > 10);

        return subcategoryMatch && priceMatch;
    });

    // Sort the filtered products based on the current sorting criteria
    if (currentSort) {
        filteredProducts.sort(currentSort);
    }

    // Display filtered and sorted products
    displayProducts(filteredProducts);
}

function sortProducts() {
    var sortOption = $("#sortDropdown").val();

    switch (sortOption) {
        case "lowPrice":
            currentSort = (a, b) => a.price - b.price;
            break;
        case "highPrice":
            currentSort = (a, b) => b.price - a.price;
            break;
        case "category":
            currentSort = (a, b) => a.category.localeCompare(b.category);
            break;
        default:
            currentSort = null; // Reset sorting if "None" or an invalid option is chosen
            break;
    }

    applyFilters(); // Apply filters and the selected sorting
}

function displayProducts(products) {
    // Clear existing content
    $("#processes").empty();

    // Display filtered and sorted products
    var len = products.length;
    for (var i = 0; i < len; i += 2) {
        var rowClass = i % 2 === 0 ? 'even-row' : 'odd-row';
        var row = $("<tr>").addClass(rowClass).appendTo("#processes");

        // Define a function to capture product information
        function createClickHandler(product) {
            return function () {
		console.log("test");
                addItemToCart(product.productID);
            };
        }

        // Product 1
        var productTile1 = $("<td>").append(
            $("<div class='MainPage'>").append(
                $("<h3>").text(products[i].title),
                $("<p>").text("Price: " + products[i].price),
                $("<p>").text("Category: " + products[i].category),
                $("<p>").text("Subcategory: " + products[i].subcategory),
                $("<p>").text("Description: " + products[i].description),
                $("<img>").attr("src", products[i].image).attr("alt", "Product Image"),
                $("<button>").text("Add to Cart").addClass("btn btn-primary add-to-cart-btn").on("click", createClickHandler(products[i]))
            )
        );
        row.append(productTile1);

        // Check if there is a second product
        if (i + 1 < len) {
            // Product 2
            var productTile2 = $("<td>").append(
                $("<div class='MainPage'>").append(
                    $("<h3>").text(products[i + 1].title),
                    $("<p>").text("Price: " + products[i + 1].price),
                    $("<p>").text("Category: " + products[i + 1].category),
                    $("<p>").text("Subcategory: " + products[i + 1].subcategory),
                    $("<p>").text("Description: " + products[i + 1].description),
                    $("<img>").attr("src", products[i + 1].image).attr("alt", "Product Image"),
                    $("<button>").text("Add to Cart").addClass("btn btn-primary add-to-cart-btn").on("click", createClickHandler(products[i + 1]))
                )
            );
            row.append(productTile2);
        }
    }
}

function createShoppingCart() {
  $.ajax({
        url: "final.php/createShoppingCart",
        method: "GET"
    }).done(function (data) {
	console.log("Data from createShoppingCart:", data);
	var cartID = data.result && data.result[0] && data.result[0].cartID;
	console.log(cartID);
	currentCartID = cartID;
    }).fail(function(error) {
	console.error("Error collecting items:", error);
    });
}


function addItemToCart(productID) {
    $.ajax({
        url: "final.php/addItemToCart?cartID=" + currentCartID + "&productID=" + productID + "&quantity=1",
        method: "GET"
    }).done(function (data) {
        console.log("Item added to cart. Product ID:", productID);
    }).fail(function(error) {
        console.error("Error collecting items:", error);
    });
}

function viewCart() {
    $.ajax({
        url: "final.php/getCartItems?cartID=" + currentCartID,
        method: "GET"
    }).done(function (data) {
        $("#processes2").empty(); // Clear existing content

        if (data && data.cart && data.cart.length > 0) {
            var itemsInCart = data.cart;

            // Display items in the cart
            var len = itemsInCart.length;
            for (var i = 0; i < len; i += 2) {
                var rowClass = i % 2 === 0 ? 'even-row' : 'odd-row';
                var row = $("<tr>").addClass(rowClass).appendTo("#processes2");

		 function createClickHandler(product) {
            	    return function () {
		        console.log("test");
                        removeItemFromCart(product.productID);
                    };
                 }


                // Item 1
                var itemTile1 = $("<td>").append(
                    $("<div class='CartItem'>").append(
                        $("<h3>").text(itemsInCart[i].title),
                        $("<p>").text("Price: " + itemsInCart[i].price),
                        $("<p>").text("Quantity: " + itemsInCart[i].quantity),
                        $("<button>").text("Remove from Cart").addClass("btn btn-danger remove-from-cart-btn").on("click", createClickHandler(itemsInCart[i]))
                    )
                );
                row.append(itemTile1);

                // Check if there is a second item
                if (i + 1 < len) {
                    // Item 2
                    var itemTile2 = $("<td>").append(
                        $("<div class='CartItem'>").append(
                            $("<h3>").text(itemsInCart[i + 1].title),
                            $("<p>").text("Price: " + itemsInCart[i + 1].price),
                            $("<p>").text("Quantity: " + itemsInCart[i + 1].quantity),
                            $("<button>").text("Remove from Cart").addClass("btn btn-danger remove-from-cart-btn").on("click", createClickHandler(itemsInCart[i + 1]))
                        )
                    );
                    row.append(itemTile2);
                }
            }
	  var totalPrice = calculateTotalPrice(itemsInCart);

            // Append the total price to the designated div
            $("#totalPriceDiv").html("<h2>Total Due: $" + totalPrice + "</h2>");
	
        } else {
            // Display a message when the cart is empty
            $("#processes").html("<p>Your cart is empty.</p>");
        }
    }).fail(function (error) {
        console.error("Error fetching cart items:", error);
    });
}

function removeItemFromCart(productID) {
    $.ajax({
        url: "final.php/removeItemFromCart?cartID=" + currentCartID + "&productID=" + productID,
        method: "GET"
    }).done(function (data) {
        console.log("Item removed from cart. Product ID:", productID);
	totalPriceOfCart = 0;
        viewCart(); // Refresh the cart display after removing an item
    }).fail(function (error) {
        console.error("Error removing item from cart:", error);
    });
}

function makeSale() {
    var amountTendered = prompt("Enter the amount tendered:");
    var paymentMethod = prompt("Enter the payment method (cash/charge):");

    if (amountTendered && paymentMethod) {
        $.ajax({
            url: "final.php/makeSale?cartID=" + currentCartID,
            method: "GET", 
            data: {
                amountTendered: amountTendered,
                paymentMethod: paymentMethod
            }
        }).done(function (data) {

            var change = (amountTendered - priceToMakeSale).toFixed(2);
                var output = "Sale successful. Change: " + change;
                $("#processes2").append("<p>" + output + "</p>");

                            
        }).fail(function (error) {
            console.error("Error making sale:", error);
            // Handle the case where the AJAX request fails
        });
    } else {
        console.error("Invalid amount or payment method.");
        // Handle the case where the user entered invalid data
    }
}

function calculateTotalPrice(itemsInCart) {
     var totalPrice = 0;
    
     if (itemsInCart && itemsInCart.length > 0) {
        for (var i = 0; i < itemsInCart.length; i++) {
            totalPrice += itemsInCart[i].price * itemsInCart[i].quantity;
        }
    }
    priceToMakeSale = totalPrice;
    return totalPrice.toFixed(2); 
}

function findCartID() {
    $.ajax({
        url: "final.php/findCartID",
        method: "GET"
    }).done(function (data) {
        console.log("cartID test");
	var locCartID = data.result[0].cartID;
	var closeDateTime = data.result[0].closeDateTime;

	console.log("Current Cart ID: " + locCartID);

	currentCartID = locCartID;

	if (closeDateTime !== null) {
		createShoppingCart();
	}

    }).fail(function(error) {
        console.error("Error collecting items:", error);
    });

}

function findClosedCarts() {
 $.ajax({
        url: "final.php/findClosedCarts",
        method: "GET"
    }).done(function (data) {
         if (data && data.result) {
            var closedCarts = data.result;

            // Iterate through the closed carts and append them to the #processes3 element
            for (var i = 0; i < closedCarts.length; i++) {
                var cart = closedCarts[i];

                // Create a row for each closed cart
                var row = $("<div>").addClass("closed-cart-row").appendTo("#processes3");

		row.append("<hr>");
                row.append("<p>Cart ID: " + cart.cartID + "</p>");
                row.append("<p>Close Date Time: " + cart.closeDateTime + "</p>");
		
                fetchCartItems(cart.cartID, row);
            }
        } else {
            // Handle the case when there are no closed carts
            $("#processes3").append("<p>No closed carts found.</p>");
        }
    }).fail(function (error) {
        console.error("Error collecting closed carts:", error);
    });
}

function fetchCartItems(cartID, row) {
    // Fetch cart items for the specified cartID
    $.ajax({
        url: "final.php/getOldCartItems?cartID=" + cartID,
        method: "GET"
    }).done(function (data) {
        if (data && data.cart !== undefined && data.cart.length > 0) {
            var itemsInCart = data.cart;
            console.log(itemsInCart);

            // Display the number of items and total price for the sale
            var numberOfItems = itemsInCart.length;
            var totalPrice = calculateTotalPrice(itemsInCart);

            row.append("<p>Number of Items: " + numberOfItems + "</p>");
            row.append("<p>Total Price: $" + totalPrice + "</p>");

            // You can add more details or customize the display as needed
        } else {
            row.append("<p>No items found in the cart.</p>");
        }
    }).fail(function (error) {
        console.error("Error fetching cart items:", error);
    });
}






