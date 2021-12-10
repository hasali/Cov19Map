class CreateProvinces < ActiveRecord::Migration[6.1]
  def change
    create_table :provinces do |t|
      t.string :coverage
      t.string :prov_name
      t.integer :numtotal_1dose
      t.string :numtotal_2dose
      t.date :date

      t.timestamps
    end
  end
end
