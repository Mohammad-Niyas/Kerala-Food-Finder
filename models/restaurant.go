package models

import "gorm.io/gorm"

type Restaurant struct {
	gorm.Model
	Name     string
	City     string
	Area     string
	Location string
	Verified bool
	Dishes   []Dish
	Reels    []Reel
}