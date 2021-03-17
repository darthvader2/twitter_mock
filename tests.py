import time
import sys
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import secrets

if sys.argv[1] == "Chrome":
    driver = webdriver.Chrome( executable_path =  "./chromedriver")
else:
    driver = webdriver.Firefox(executable_path =   "./geckodriver.exe")

#driver.get("http://127.0.0.1:8000/")
#driver.get("https://twiddermock.herokuapp.com/")




def run_tests():
    if len(sys.argv[1:]) >= 1:
        random_email = secrets.token_hex(10)
        email = random_email + "@gmail.com"
        password = repeat_password = "000000000000"
        message1 = "This is an automated message from Selenium (Home Tab)"
        message2 = "This is an automated message from Selenium (Browse Tab)"
        test_sign_up(email, password, repeat_password, "Test", "User", "Male", "Linkoping", "Sweden")
        test_sign_in(email, password)
        time.sleep(3)
        driver.find_element_by_name("home").send_keys(Keys.RETURN)
        test_post_message(message1)
        driver.find_element_by_name("browse").send_keys(Keys.RETURN)
        test_search_user(email)
        test_post_message_to_others(message2)
        driver.find_element_by_name("account").send_keys(Keys.RETURN)
        new_password = "newpassword000"
        test_change_password(oldpassword=password, newpassword=new_password, repeat_newpassword=new_password)
        test_logout()
        driver.close()
    else:
        print("Please specify the browser you would like to run the tests!")
        sys.exit(1)


def test_sign_in(email, password):
    email_field = driver.find_element_by_name("email")
    password_field = driver.find_element_by_name("psw")
    login_button = driver.find_element_by_name("sign_in_button")

    email_field.send_keys(email)
    time.sleep(1)
    password_field.send_keys(password)
    time.sleep(1)

    login_button.send_keys(Keys.RETURN)
    time.sleep(1)


def test_sign_up(email, password, repeat_password, firstname, familyname, gender, city, country):
    email_field = driver.find_element_by_id("email_up")
    password_field = driver.find_element_by_id("psw_up")
    repeat_password_field = driver.find_element_by_id("psw-repeat")
    firstname_field = driver.find_element_by_id("first-name")
    familyname_field = driver.find_element_by_id("family-name")
    gender_field = driver.find_element_by_id("gender")
    city_field = driver.find_element_by_id("city")
    country_field = driver.find_element_by_id("country")
    signup_button = driver.find_element_by_id("signup_button")

    email_field.send_keys(email)
    time.sleep(1)
    password_field.send_keys(password)
    time.sleep(1)
    repeat_password_field.send_keys(repeat_password)
    time.sleep(1)
    firstname_field.send_keys(firstname)
    time.sleep(1)
    familyname_field.send_keys(familyname)
    time.sleep(1)
    gender_field.send_keys(gender)
    time.sleep(1)
    city_field.send_keys(city)
    time.sleep(1)
    country_field.send_keys(country)
    time.sleep(1)

    signup_button.send_keys(Keys.RETURN)
    time.sleep(1)


def test_post_message(message):
    post_message_filed = driver.find_element_by_name("psm")
    post_button = driver.find_element_by_name("psm_button")

    post_message_filed.send_keys(message)
    time.sleep(1)

    post_button.send_keys(Keys.RETURN)
    time.sleep(1)


def test_search_user(email):
    email_filed = driver.find_element_by_id("usersearch")
    search_button = driver.find_element_by_name("usersearch_button")

    email_filed.send_keys(email)
    time.sleep(1)

    search_button.send_keys(Keys.RETURN)
    time.sleep(1)


def test_post_message_to_others(message):
    post_message_filed = driver.find_element_by_name("wallpsm")
    post_button = driver.find_element_by_name("wallpsm_button")
    time.sleep(1)

    post_message_filed.send_keys(message)
    time.sleep(1)

    post_button.send_keys(Keys.RETURN)
    time.sleep(1)


def test_change_password(oldpassword, newpassword, repeat_newpassword):
    oldpassword_filed = driver.find_element_by_name("old-psw")
    newpassword_field = driver.find_element_by_name("psw")
    repeat_newpassword_field = driver.find_element_by_name("psw-repeat")
    change_password_button = driver.find_element_by_name("psw_change_button")

    oldpassword_filed.send_keys(oldpassword)
    time.sleep(1)
    newpassword_field.send_keys(newpassword)
    time.sleep(1)
    repeat_newpassword_field.send_keys(repeat_newpassword)
    time.sleep(1)

    change_password_button.send_keys(Keys.RETURN)
    time.sleep(3)


def test_logout():
    logout_button = driver.find_element_by_name("sign_out_button")
    logout_button.send_keys(Keys.RETURN)
    time.sleep(3)


if __name__ == '__main__':
    run_tests()