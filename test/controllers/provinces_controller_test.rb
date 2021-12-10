require "test_helper"

class ProvincesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @province = provinces(:one)
  end

  test "should get index" do
    get provinces_url
    assert_response :success
  end

  test "should get new" do
    get new_province_url
    assert_response :success
  end

  test "should create province" do
    assert_difference('Province.count') do
      post provinces_url, params: { province: { coverage: @province.coverage, date: @province.date, numtotal_1dose: @province.numtotal_1dose, numtotal_2dose: @province.numtotal_2dose, prov_name: @province.prov_name } }
    end

    assert_redirected_to province_url(Province.last)
  end

  test "should show province" do
    get province_url(@province)
    assert_response :success
  end

  test "should get edit" do
    get edit_province_url(@province)
    assert_response :success
  end

  test "should update province" do
    patch province_url(@province), params: { province: { coverage: @province.coverage, date: @province.date, numtotal_1dose: @province.numtotal_1dose, numtotal_2dose: @province.numtotal_2dose, prov_name: @province.prov_name } }
    assert_redirected_to province_url(@province)
  end

  test "should destroy province" do
    assert_difference('Province.count', -1) do
      delete province_url(@province)
    end

    assert_redirected_to provinces_url
  end
end
