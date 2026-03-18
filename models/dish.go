package models

import "gorm.io/gorm"

type Dish struct {
	gorm.Model
	Name         string
	RestaurantID uint
	Restaurant   Restaurant
	Category     string
	Notes        string
	Saves        int
	Reviews      []Review
	SavedBy      []Save
}