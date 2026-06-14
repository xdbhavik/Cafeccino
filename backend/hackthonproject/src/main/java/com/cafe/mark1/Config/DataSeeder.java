package com.cafe.mark1.Config;

import com.cafe.mark1.Repository.CafeTableRepository;
import com.cafe.mark1.Repository.CategoryRepository;
import com.cafe.mark1.Repository.FloorRepository;
import com.cafe.mark1.Repository.PaymentSettingsRepository;
import com.cafe.mark1.Repository.ProductRepository;
import com.cafe.mark1.Repository.PromotionRepository;
import com.cafe.mark1.Repository.UserRepository;
import com.cafe.mark1.model.CafeTable;
import com.cafe.mark1.model.Category;
import com.cafe.mark1.model.DiscountType;
import com.cafe.mark1.model.Floor;
import com.cafe.mark1.model.PaymentSettings;
import com.cafe.mark1.model.Product;
import com.cafe.mark1.model.Promotion;
import com.cafe.mark1.model.PromotionType;
import com.cafe.mark1.model.Role;
import com.cafe.mark1.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final FloorRepository floorRepository;
    private final CafeTableRepository tableRepository;
    private final PaymentSettingsRepository paymentSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        patchLegacyTableColumns();
        seedUsers();
        seedPaymentSettings();
        seedCatalog();
        seedFloorPlan();
        seedPromotions();
    }

    private void patchLegacyTableColumns() {
        alterColumnDefaultIfExists("cafe_tables", "hasActiveOrder", "BOOLEAN NOT NULL DEFAULT FALSE");
        alterColumnDefaultIfExists("cafe_tables", "isActive", "BOOLEAN NOT NULL DEFAULT TRUE");
    }

    private void alterColumnDefaultIfExists(String tableName, String columnName, String definition) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " MODIFY COLUMN " + columnName + " " + definition);
            log.info("Patched legacy column default: {}.{}", tableName, columnName);
        } catch (Exception ignored) {
            log.debug("Legacy column not patched: {}.{}", tableName, columnName);
        }
    }

    private void seedUsers() {
        createUserIfMissing("Admin", "admin@cafe.com", "admin123", Role.ADMIN);
        createUserIfMissing("Cashier", "cashier@cafe.com", "cashier123", Role.EMPLOYEE);
        createUserIfMissing("Chef", "chef@cafe.com", "chef123", Role.CHEF);
    }

    private void createUserIfMissing(String name, String email, String password, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .isArchived(false)
                .build());
        log.info("Seeded user: {} ({})", email, role);
    }

    private void seedPaymentSettings() {
        if (paymentSettingsRepository.existsById(1L)) {
            return;
        }

        paymentSettingsRepository.save(PaymentSettings.builder()
                .id(1L)
                .cashEnabled(true)
                .cardEnabled(true)
                .upiEnabled(true)
                .upiId("cafe@ybl")
                .build());
        log.info("Seeded default payment settings");
    }

    private void seedCatalog() {
        Category coffee = createCategoryIfMissing("Coffee", "#8B5CF6");
        Category tea = createCategoryIfMissing("Tea", "#22C55E");
        Category snacks = createCategoryIfMissing("Snacks", "#F97316");
        Category dessert = createCategoryIfMissing("Dessert", "#EC4899");
        Category beverages = createCategoryIfMissing("Beverages", "#06B6D4");
        Category breakfast = createCategoryIfMissing("Breakfast", "#F59E0B");
        Category pasta = createCategoryIfMissing("Pasta", "#EF4444");
        Category pizza = createCategoryIfMissing("Pizza", "#84CC16");
        Category burgers = createCategoryIfMissing("Burgers", "#A855F7");
        Category combos = createCategoryIfMissing("Combos", "#14B8A6");

        createProductIfMissing("Espresso", coffee, 90.0, "cup", 5.0, true, "Strong single-shot coffee");
        createProductIfMissing("Cappuccino", coffee, 150.0, "cup", 5.0, true, "Classic milk coffee");
        createProductIfMissing("Cold Coffee", coffee, 180.0, "glass", 5.0, true, "Chilled blended coffee");
        createProductIfMissing("Americano", coffee, 130.0, "cup", 5.0, true, "Black coffee with hot water");
        createProductIfMissing("Cafe Latte", coffee, 160.0, "cup", 5.0, true, "Smooth espresso with steamed milk");
        createProductIfMissing("Mocha", coffee, 190.0, "cup", 5.0, true, "Coffee with chocolate");
        createProductIfMissing("Caramel Macchiato", coffee, 210.0, "cup", 5.0, true, "Caramel layered espresso drink");
        createProductIfMissing("Iced Americano", coffee, 150.0, "glass", 5.0, true, "Chilled black coffee");
        createProductIfMissing("Masala Chai", tea, 70.0, "cup", 5.0, true, "Indian spiced tea");
        createProductIfMissing("Green Tea", tea, 90.0, "cup", 5.0, true, "Light herbal tea");
        createProductIfMissing("Lemon Tea", tea, 95.0, "cup", 5.0, true, "Tea with lemon");
        createProductIfMissing("Ginger Tea", tea, 85.0, "cup", 5.0, true, "Fresh ginger tea");
        createProductIfMissing("Iced Tea", tea, 130.0, "glass", 5.0, true, "Cold lemon iced tea");
        createProductIfMissing("Hot Chocolate", beverages, 160.0, "cup", 5.0, true, "Warm chocolate drink");
        createProductIfMissing("Fresh Lime Soda", beverages, 120.0, "glass", 5.0, true, "Sweet and salty lime soda");
        createProductIfMissing("Mango Smoothie", beverages, 190.0, "glass", 5.0, true, "Mango yogurt smoothie");
        createProductIfMissing("Oreo Shake", beverages, 210.0, "glass", 5.0, true, "Cookies and cream shake");
        createProductIfMissing("Mineral Water", beverages, 40.0, "bottle", 5.0, false, "Packaged drinking water");
        createProductIfMissing("Toast Butter", breakfast, 90.0, "plate", 5.0, true, "Toasted bread with butter");
        createProductIfMissing("Cheese Omelette", breakfast, 150.0, "plate", 5.0, true, "Omelette with cheese");
        createProductIfMissing("Pancakes", breakfast, 220.0, "plate", 5.0, true, "Pancakes with syrup");
        createProductIfMissing("Poha", breakfast, 110.0, "plate", 5.0, true, "Light Indian breakfast");
        createProductIfMissing("Veg Sandwich", snacks, 160.0, "plate", 5.0, true, "Grilled vegetable sandwich");
        createProductIfMissing("French Fries", snacks, 140.0, "plate", 5.0, true, "Crispy fries");
        createProductIfMissing("Garlic Bread", snacks, 150.0, "plate", 5.0, true, "Toasted garlic bread");
        createProductIfMissing("Nachos", snacks, 220.0, "plate", 5.0, true, "Crispy nachos with dip");
        createProductIfMissing("Cheese Corn Nuggets", snacks, 190.0, "plate", 5.0, true, "Fried cheese corn bites");
        createProductIfMissing("White Sauce Pasta", pasta, 280.0, "plate", 5.0, true, "Creamy white sauce pasta");
        createProductIfMissing("Red Sauce Pasta", pasta, 260.0, "plate", 5.0, true, "Tangy tomato pasta");
        createProductIfMissing("Mac and Cheese", pasta, 300.0, "plate", 5.0, true, "Cheesy macaroni");
        createProductIfMissing("Margherita Pizza", pizza, 320.0, "pizza", 5.0, true, "Classic cheese pizza");
        createProductIfMissing("Farmhouse Pizza", pizza, 420.0, "pizza", 5.0, true, "Veg loaded pizza");
        createProductIfMissing("Paneer Tikka Pizza", pizza, 450.0, "pizza", 5.0, true, "Paneer tikka pizza");
        createProductIfMissing("Veg Burger", burgers, 180.0, "piece", 5.0, true, "Classic veg burger");
        createProductIfMissing("Cheese Burger", burgers, 220.0, "piece", 5.0, true, "Burger with cheese");
        createProductIfMissing("Paneer Burger", burgers, 250.0, "piece", 5.0, true, "Paneer patty burger");
        createProductIfMissing("Chocolate Brownie", dessert, 170.0, "piece", 5.0, false, "Rich chocolate brownie");
        createProductIfMissing("Blueberry Cheesecake", dessert, 240.0, "slice", 5.0, false, "Blueberry cheesecake slice");
        createProductIfMissing("Tiramisu", dessert, 260.0, "slice", 5.0, false, "Coffee-flavored dessert");
        createProductIfMissing("Vanilla Ice Cream", dessert, 120.0, "scoop", 5.0, false, "Vanilla ice cream scoop");
        createProductIfMissing("Brownie Sundae", dessert, 260.0, "bowl", 5.0, false, "Brownie with ice cream");
        createProductIfMissing("Coffee and Sandwich Combo", combos, 280.0, "combo", 5.0, true, "Cappuccino with veg sandwich");
        createProductIfMissing("Pizza Combo", combos, 520.0, "combo", 5.0, true, "Pizza with iced tea");
        createProductIfMissing("Breakfast Combo", combos, 300.0, "combo", 5.0, true, "Omelette with coffee");
    }

    private Category createCategoryIfMissing(String name, String colorHex) {
        return categoryRepository.findAll().stream()
                .filter(category -> category.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Category category = categoryRepository.save(Category.builder()
                            .name(name)
                            .colorHex(colorHex)
                            .build());
                    log.info("Seeded category: {}", name);
                    return category;
                });
    }

    private void createProductIfMissing(
            String name,
            Category category,
            Double price,
            String uom,
            Double tax,
            Boolean showOnKDS,
            String description
    ) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE UPPER(name) = UPPER(?)",
                Integer.class,
                name
        );
        if (count != null && count > 0) {
            return;
        }

        productRepository.save(Product.builder()
                .name(name)
                .category(category)
                .price(price)
                .uom(uom)
                .tax(tax)
                .description(description)
                .showOnKDS(showOnKDS)
                .imagePath(null)
                .isActive(true)
                .build());
        log.info("Seeded product: {}", name);
    }

    private void seedFloorPlan() {
        Floor groundFloor = createFloorIfMissing("Ground Floor");
        Floor firstFloor = createFloorIfMissing("First Floor");
        Floor terrace = createFloorIfMissing("Terrace");
        Floor takeaway = createFloorIfMissing("Takeaway");

        createTableIfMissing("T1", 2, groundFloor);
        createTableIfMissing("T2", 4, groundFloor);
        createTableIfMissing("T3", 4, groundFloor);
        createTableIfMissing("T4", 6, groundFloor);
        createTableIfMissing("T5", 2, groundFloor);
        createTableIfMissing("T6", 4, groundFloor);
        createTableIfMissing("T7", 6, groundFloor);
        createTableIfMissing("T8", 8, groundFloor);
        createTableIfMissing("F1", 2, firstFloor);
        createTableIfMissing("F2", 4, firstFloor);
        createTableIfMissing("F3", 4, firstFloor);
        createTableIfMissing("F4", 6, firstFloor);
        createTableIfMissing("F5", 8, firstFloor);
        createTableIfMissing("TR1", 2, terrace);
        createTableIfMissing("TR2", 4, terrace);
        createTableIfMissing("TR3", 4, terrace);
        createTableIfMissing("TR4", 6, terrace);
        createTableIfMissing("TA1", 1, takeaway);
        createTableIfMissing("TA2", 1, takeaway);
        createTableIfMissing("TA3", 1, takeaway);
    }

    private Floor createFloorIfMissing(String name) {
        return floorRepository.findAll().stream()
                .filter(floor -> floor.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Floor floor = floorRepository.save(Floor.builder()
                            .name(name)
                            .build());
                    log.info("Seeded floor: {}", name);
                    return floor;
                });
    }

    private void createTableIfMissing(String tableNumber, Integer seats, Floor floor) {
        if (tableExists(tableNumber)) {
            return;
        }

        List<String> tableColumns = getTableColumns("cafe_tables");
        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        addColumnIfPresent(tableColumns, columns, values, "tableNumber", tableNumber);
        addColumnIfPresent(tableColumns, columns, values, "table_number", tableNumber);
        addColumnIfPresent(tableColumns, columns, values, "seats", seats);
        addColumnIfPresent(tableColumns, columns, values, "isActive", true);
        addColumnIfPresent(tableColumns, columns, values, "is_active", true);
        addColumnIfPresent(tableColumns, columns, values, "hasActiveOrder", false);
        addColumnIfPresent(tableColumns, columns, values, "has_active_order", false);
        addColumnIfPresent(tableColumns, columns, values, "floor_id", floor.getId());

        String placeholders = String.join(", ", columns.stream().map(column -> "?").toList());
        String columnNames = String.join(", ", columns.stream().map(column -> "`" + column + "`").toList());
        jdbcTemplate.update("INSERT INTO cafe_tables (" + columnNames + ") VALUES (" + placeholders + ")", values.toArray());
        log.info("Seeded table: {}", tableNumber);
    }

    private boolean tableExists(String tableNumber) {
        List<String> tableColumns = getTableColumns("cafe_tables");
        List<String> checks = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        if (tableColumns.contains("tableNumber")) {
            checks.add("`tableNumber` = ?");
            values.add(tableNumber);
        }
        if (tableColumns.contains("table_number")) {
            checks.add("`table_number` = ?");
            values.add(tableNumber);
        }
        if (checks.isEmpty()) {
            return false;
        }

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM cafe_tables WHERE " + String.join(" OR ", checks),
                Integer.class,
                values.toArray()
        );
        return count != null && count > 0;
    }

    private List<String> getTableColumns(String tableName) {
        return jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                String.class,
                tableName
        );
    }

    private void addColumnIfPresent(
            List<String> tableColumns,
            List<String> columns,
            List<Object> values,
            String column,
            Object value
    ) {
        if (tableColumns.contains(column)) {
            columns.add(column);
            values.add(value);
        }
    }

    private void seedPromotions() {
        createOrderPromotionIfMissing("Welcome Discount", "WELCOME10", DiscountType.PERCENT, "10", "100");
        createOrderPromotionIfMissing("Flat 50 Off", "FLAT50", DiscountType.FIXED, "50", "499");
        createOrderPromotionIfMissing("Weekend Treat", "WEEKEND15", DiscountType.PERCENT, "15", "699");
        createOrderPromotionIfMissing("Big Order Saver", "BIGORDER20", DiscountType.PERCENT, "20", "1499");
        createOrderPromotionIfMissing("Coffee Lover", "COFFEE25", DiscountType.FIXED, "25", "199");
    }

    private void createOrderPromotionIfMissing(
            String name,
            String code,
            DiscountType discountType,
            String discountValue,
            String minOrderAmount
    ) {
        if (promotionRepository.findByCodeAndIsActiveTrue(code).isPresent()) {
            return;
        }

        List<String> tableColumns = getTableColumns("promotions");
        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusYears(1);

        addColumnIfPresent(tableColumns, columns, values, "name", name);
        addColumnIfPresent(tableColumns, columns, values, "code", code);
        addColumnIfPresent(tableColumns, columns, values, "type", PromotionType.ORDER.name());
        addColumnIfPresent(tableColumns, columns, values, "discountType", discountType.name());
        addColumnIfPresent(tableColumns, columns, values, "discount_type", discountType.name());
        addColumnIfPresent(tableColumns, columns, values, "discountValue", new BigDecimal(discountValue));
        addColumnIfPresent(tableColumns, columns, values, "discount_value", new BigDecimal(discountValue));
        addColumnIfPresent(tableColumns, columns, values, "minOrderAmount", new BigDecimal(minOrderAmount));
        addColumnIfPresent(tableColumns, columns, values, "min_order_amount", new BigDecimal(minOrderAmount));
        addColumnIfPresent(tableColumns, columns, values, "isActive", true);
        addColumnIfPresent(tableColumns, columns, values, "is_active", true);
        addColumnIfPresent(tableColumns, columns, values, "startDate", startDate);
        addColumnIfPresent(tableColumns, columns, values, "start_date", startDate);
        addColumnIfPresent(tableColumns, columns, values, "endDate", endDate);
        addColumnIfPresent(tableColumns, columns, values, "end_date", endDate);

        String placeholders = String.join(", ", columns.stream().map(column -> "?").toList());
        String columnNames = String.join(", ", columns.stream().map(column -> "`" + column + "`").toList());
        jdbcTemplate.update("INSERT INTO promotions (" + columnNames + ") VALUES (" + placeholders + ")", values.toArray());
        log.info("Seeded coupon: {}", code);
    }
}
