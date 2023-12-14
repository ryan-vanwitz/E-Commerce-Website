<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function setTemp ($location, $sensor, $value) {
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($retData);
	}

	public static function getProduct ($category, $subcategory, $id) {
                        try {
                               $retData["result"] = GET_SQL("select * from product where category like ? and subcategory like ? and (productID = ? or ? = '0') order by description", $category,$subcategory,$id,$id);
				 $retData["status"]=0;
                              $retData["message"]="Within the '$category' category, you have loacted '$subcategory' with an id number of '$id'"; 
                        }
                        catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]="We could not locate the '$subcategory' within the '$category' department with an id number of '$id'";
                        }

                return json_encode ($retData);
        }

	public static function createShoppingCart () {
			EXEC_SQL("INSERT into cart (closeDateTime) values (null)");
			$retData["result"]=GET_SQL("select last_insert_rowid() AS cartID");
               		return json_encode ($retData);
        }

	public static function addItemToCart($cartID, $productID, $quantity) {

			$CART=GET_SQL("SELECT cart.cartID FROM cart WHERE cart.cartID=? AND cart.closeDateTime IS NULL", $cartID);
			if (count($CART) > 0) {
				$ITEM=GET_SQL("SELECT * FROM cartItems 
                        where cartID=? And productID = ?", $cartID,$productID);
				if (count($ITEM) > 0) {
					EXEC_SQL("UPDATE cartItems SET quantity=quantity+? WHERE cartID=? AND
			productID = ?", $quantity, $cartID, $productID);
					$retData["found"]=0;
					$retData["message"] = "existing product $productID set to $quantity";
				}
				else {
					EXEC_SQL("INSERT INTO cartItems (quantity, cartID, productID) VALUES
				(?, ?, ?)", $quantity, $cartID, $productID);
					$retData["found"] = 0;
					$retData["message"] = "Product $productID added to cart = $quantity";
				}
			}
			else {
				$retData["found"]=1;
				$retData["message"] = "Cart not found or not available";
			}

		return json_encode ($retData);
		}
	
	public static function getCartItems($cartID) {

		$CART = GET_SQL("SELECT cart.cartID FROM cart WHERE cart.cartID=? AND cart.closeDateTime IS NULL", $cartID);
		
		if (count($CART) > 0) {
			$retData["cart"] = GET_SQL("SELECT * FROM cart JOIN cartItems USING (cartID) JOIN product USING (productID) WHERE cart.cartID=? AND cart.closeDateTime IS NULL ORDER BY category, subcategory, title", $cartID);
			$retData["found"] = 0;
			$retData["message"] = "Cart items returned from cart: $cartID";
		} else {
       			 $retData["found"] = 1;
        		$retData["message"] = "Cart and its items were not found or not available";
    		}

    		return json_encode($retData);
	}

	public static function makeSale($cartID) {

		$CART = GET_SQL("SELECT cart.cartID FROM cart WHERE cart.cartID=? AND cart.closeDateTime IS NULL", $cartID);
		
		if (count($CART) > 0) {
			EXEC_SQL("UPDATE cart SET closeDateTime = CURRENT_TIMESTAMP WHERE cartID=?",$cartID,);

			$retData["found"] = 0;
			$retData["message"] = "closed cart $cartID";
		} else {
			$retData["found"]=1;
			$retData["message"] = "Cart not found or not available";
		}

		return json_encode($retData);

	}

	public static function removeItemFromCart($cartID, $productID) {

		$found = GET_SQL("SELECT cart.cartID FROM cart JOIN cartItems USING (cartID) WHERE cart.cartID=? AND productID=? AND cart.closeDateTime IS NULL", $cartID, $productID);

		if (count($found) > 0) {
			EXEC_SQL("DELETE FROM cartItems WHERE cartID=? AND productID=?", $cartID, $productID);
			$retData["found"]=0;
			$retData["message"]="found";
		} else {
			$retData["found"]=1;
			$retData["message"] = "Not found";
		}

		return json_encode($retData);

	}

	public static function findClosedCarts() {

		$retData["result"] = GET_SQL("SELECT * FROM cart WHERE closeDateTime IS NOT NULL ORDER BY closeDateTime DESC");

		return json_encode($retData);

	}
		
	public static function findCartID() {
	    try {
		$result = GET_SQL("SELECT * FROM cart ORDER BY cartID DESC LIMIT 1");
		
		$retData["result"] = $result;
		$retData["found"] = 0;
		$retData["message"] = "found";
	    } catch (Exception $e) {
		$retData["found"] = 1;
		$retData["message"] = $e->getMessage();
	    }
	
	  return json_encode($retData);


	}

	public static function getOldCartItems($cartID) {

		$CART = GET_SQL("SELECT cart.cartID FROM cart WHERE cart.cartID=? AND cart.closeDateTime IS NOT NULL", $cartID);
		
		if (count($CART) > 0) {
			$retData["cart"] = GET_SQL("SELECT * FROM cart JOIN cartItems USING (cartID) JOIN product USING (productID) WHERE cart.cartID=? AND cart.closeDateTime IS NOT NULL ORDER BY category, subcategory, title", $cartID);
			$retData["found"] = 0;
			$retData["message"] = "Cart items returned from cart: $cartID";
		} else {
       			 $retData["found"] = 1;
        		$retData["message"] = "Cart and its items were not found or not available";
    		}

    		return json_encode($retData);
	}


		

}

