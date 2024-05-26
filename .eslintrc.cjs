module.exports = {
    parser: "@typescript-eslint/parser",  
	ignorePatterns: ["*.js"],
    parserOptions: {  
        project: ["./tsconfig.json", "./.examples/tic-tac-toe/tsconfig.json", "./packages/eslint-plugin-theseus/tsconfig.json"],
        ecmaVersion: 2018,  
        sourceType: "module",  
        tsconfigRootDir: "./",  
    },  
    extends: [  
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",  
        "plugin:mocha/recommended",  
        "prettier",
		"plugin:theseus/recommended"
    ],  
	settings: {
		'import/resolver': {
			node: {
			  paths: ["eslint-rules"]
			}
		  }
	},
    plugins: ["unused-imports"],  
    rules: {  
		indent: ["error", "tab"],
        quotes: [2, "double", { avoidEscape: true }],  
        "unused-imports/no-unused-imports": "error",  
        "no-async-promise-executor": "off",  
        "mocha/no-setup-in-describe": "off",  
        "@typescript-eslint/no-floating-promises": ["error"],  
        "@typescript-eslint/no-explicit-any": "off",  
        "@typescript-eslint/consistent-type-imports": "error",  
        "@typescript-eslint/no-unused-vars": [  
            "error",  
            {  
                args: "all",  
                argsIgnorePattern: "^_",  
                caughtErrors: "all",  
                caughtErrorsIgnorePattern: "^_",  
                destructuredArrayIgnorePattern: "^_",  
                varsIgnorePattern: "^_",  
                ignoreRestSiblings: true,  
            },  
        ],
        "semi": ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "array-bracket-spacing": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "max-len": ["error", { "code": 120, "ignoreUrls": true, "ignoreTemplateLiterals": true, "ignoreStrings": true }],
        "arrow-parens": ["error", "always"],
        "no-tabs": "off", // Since you're using tabs
        "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
        "keyword-spacing": ["error", { "before": true, "after": true }],	
		"brace-style": ["error", "allman", { "allowSingleLine": true }],
    },  
    overrides: [  
        {  
            files: ["**/*.test.ts"],  
            rules: {  
                "@typescript-eslint/no-unused-vars": ["off"],  
            },  
        },  
    ],  
};
