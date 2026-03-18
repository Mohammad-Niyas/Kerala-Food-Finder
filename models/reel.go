package models

import "gorm.io/gorm"

type Reel struct {
	gorm.Model
	RestaurantID uint
	Restaurant   Restaurant
	ReelLink     string
	AddedBy      string
}