package models

import "gorm.io/gorm"

type Review struct {
	gorm.Model
	DishID   uint
	Dish     Dish
	UserName string
	Rating   int
	Taste    int
	Value    int
	Ambience int
	Comment  string
	Helpful  int
	Visited  bool
}